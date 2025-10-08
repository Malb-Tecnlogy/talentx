import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { jwtVerify, createRemoteJWKSet } from "jose";

// Extend session data interface
declare module "express-session" {
  interface SessionData {
    userId?: string;
    user?: any;
    oauthState?: string;
    oauthNonce?: string;
    pendingJobId?: string;
    returnUrl?: string;
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

export function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  console.log("[AUTH] isAuthenticated check for:", req.method, req.path);

  // Check for session-based authentication
  if (req.session?.userId) {
    console.log("[AUTH] Session-based auth: user", req.session.userId);
    return next();
  }

  console.log("[AUTH] No valid session found");
  return res.status(401).json({ message: "Unauthorized" });
};

// Note: regenerateSession function is defined at the end of the file

// Validate state parameter to prevent CSRF attacks
export function validateState(req: any, providedState: string): boolean {
  const sessionState = req.session?.oauthState;
  if (!sessionState || sessionState !== providedState) {
    console.warn("OAuth state validation failed:", {
      sessionState,
      providedState,
    });
    return false;
  }
  // Clear the state after validation
  delete req.session.oauthState;
  return true;
}

// Note: OAuth helper functions are defined at the end of the file

// Google OAuth Functions
export async function getGoogleOAuthURL(state: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string): Promise<any> {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
      code,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error("Failed to exchange Google code for token");
  }

  return await tokenResponse.json();
}

export async function getGoogleUserInfo(accessToken: string): Promise<any> {
  const userResponse = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!userResponse.ok) {
    throw new Error("Failed to get Google user info");
  }

  return await userResponse.json();
}

// OAuth Account Management
export async function createOrLinkOAuthUser(
  provider: "google" | "apple",
  userData: {
    providerUserId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  },
): Promise<{ user: any; isNewUser: boolean }> {
  console.log(`[OAuth] Creating/linking ${provider} user:`, {
    email: userData.email,
    providerUserId: userData.providerUserId,
  });

  // Check if OAuth account already exists
  const existingOAuthAccount = await storage.getOAuthAccount(
    provider,
    userData.providerUserId,
  );

  if (existingOAuthAccount) {
    console.log("[OAuth] Existing OAuth account found, fetching user");
    // Get existing user
    const user = await storage.getUser(existingOAuthAccount.userId);
    return { user, isNewUser: false };
  }

  // Check if user exists by email
  let user = await storage.getUserByEmail(userData.email);
  let isNewUser = false;

  if (!user) {
    console.log("[OAuth] Creating new user for OAuth account");
    // Create new user with OAuth
    // Generate a unique username from email or provider ID
    const baseUsername = userData.email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const uniqueSuffix = userData.providerUserId.substring(0, 8);
    const username = `${baseUsername}_${uniqueSuffix}`;

    console.log("[OAuth] Generated username:", username);

    try {
      user = await storage.upsertUser({
        email: userData.email.toLowerCase(),
        username, // Unique username for OAuth users
        password: "oauth_user_no_password", // Dummy password since OAuth users don't use password auth
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        role: "professional", // Default role
        emailVerified: true, // OAuth emails are considered verified
      });
      console.log("[OAuth] User created successfully:", user.id);
      isNewUser = true;
    } catch (error) {
      console.error("[OAuth] Error creating user:", error);
      throw error;
    }
  } else {
    console.log("[OAuth] Existing user found by email:", user.id);
  }

  // Create OAuth account link
  await storage.createOAuthAccount({
    userId: user.id,
    provider,
    providerUserId: userData.providerUserId,
    email: userData.email.toLowerCase(),
  });

  return { user, isNewUser };
}

// Apple Sign In Functions
export async function getAppleOAuthURL(
  state: string,
  nonce: string,
): Promise<string> {
  const params = new URLSearchParams({
    client_id: process.env.APPLE_CLIENT_ID!,
    redirect_uri: process.env.APPLE_REDIRECT_URI!,
    response_type: "code id_token",
    scope: "name email",
    response_mode: "form_post",
    state,
    nonce,
  });

  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

// Apple JWKS URL for secure token verification
const APPLE_JWKS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys"),
);

// Validate Apple ID token with proper signature verification
export async function validateAppleIdToken(
  idToken: string,
  expectedNonce?: string,
): Promise<any> {
  try {
    // Verify the token with Apple's public keys using jose library
    const { payload } = await jwtVerify(idToken, APPLE_JWKS, {
      issuer: "https://appleid.apple.com",
      audience: process.env.APPLE_CLIENT_ID,
    });

    // Validate nonce if provided (SHA256 hash of original nonce)
    if (expectedNonce && payload.nonce) {
      const expectedNonceHash = crypto
        .createHash("sha256")
        .update(expectedNonce)
        .digest("base64url");
      if (payload.nonce !== expectedNonceHash) {
        throw new Error("Nonce validation failed");
      }
    }

    // Additional security checks
    if (payload.email && !payload.email_verified) {
      throw new Error("Apple email not verified");
    }

    return payload;
  } catch (error) {
    console.error("Apple ID token validation error:", error);
    throw new Error(
      `Invalid Apple ID token: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Extract user info from Apple Sign In
export function extractAppleUserInfo(
  idTokenPayload: any,
  userInfo?: any,
): {
  providerUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
} {
  return {
    providerUserId: idTokenPayload.sub,
    email: idTokenPayload.email,
    firstName: userInfo?.name?.firstName,
    lastName: userInfo?.name?.lastName,
  };
}

// Get appropriate dashboard redirect based on user role
export function getDashboardRedirect(
  user: any,
  isNewUser: boolean = false,
): string {
  const welcomeParam = isNewUser ? "?welcome=true" : "";

  switch (user.role) {
    case "admin":
      return `/admin${welcomeParam}`;
    case "company":
      return `/company${welcomeParam}`;
    case "professional":
      return `/professional${welcomeParam}`;
    default:
      return `/${welcomeParam}`;
  }
}

// CSRF protection helpers
export function generateSecureState(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateSecureNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function storeOAuthState(session: any, state: string, nonce?: string) {
  session.oauthState = state;
  if (nonce) {
    session.oauthNonce = nonce;
  }
}

export function validateOAuthState(
  session: any,
  receivedState: string,
): boolean {
  const storedState = session.oauthState;
  if (!storedState || storedState !== receivedState) {
    return false;
  }
  // Clear stored state after validation
  delete session.oauthState;
  return true;
}

export function validateOAuthNonce(
  session: any,
  expectedNonce: string,
): boolean {
  const storedNonce = session.oauthNonce;
  if (!storedNonce || storedNonce !== expectedNonce) {
    return false;
  }
  // Clear stored nonce after validation
  delete session.oauthNonce;
  return true;
}

// Process pending job application after OAuth login
export async function processPendingJobApplication(
  session: any,
  userId: string,
): Promise<{ jobId?: string; returnUrl?: string }> {
  const pendingJobId = session.pendingJobId;
  const returnUrl = session.returnUrl;

  if (pendingJobId) {
    console.log("[OAuth] Processing pending job application:", {
      userId,
      jobId: pendingJobId,
    });

    try {
      // Import storage here to avoid circular dependencies
      const { storage } = await import("./storage.js");

      // Check if professional profile exists
      const professional = await storage.getProfessionalByUserId(userId);

      if (professional) {
        // Check if application already exists
        const existingApp = await storage.getApplicationByJobAndProfessional(
          pendingJobId,
          professional.id,
        );

        if (!existingApp) {
          // Create the job application
          await storage.createApplication({
            jobId: pendingJobId,
            professionalId: professional.id,
            status: "pending",
          });
          console.log("[OAuth] Job application created successfully:", {
            jobId: pendingJobId,
            professionalId: professional.id,
          });
        } else {
          console.log("[OAuth] Job application already exists");
        }
      } else {
        console.log(
          "[OAuth] No professional profile found, cannot create application",
        );
      }
    } catch (error) {
      console.error("[OAuth] Error processing pending job application:", error);
    }

    // Clear the pending job from session
    delete session.pendingJobId;
  }

  // Clear return URL from session and return it
  if (returnUrl) {
    delete session.returnUrl;
  }

  return { jobId: pendingJobId, returnUrl };
}

// Regenerate session to prevent fixation attacks
export function regenerateSession(req: any): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
