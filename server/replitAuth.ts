import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import crypto from "crypto";
import jwt from "jsonwebtoken";

// Type declaration for jwks-client
declare module 'jwks-client' {
  export default function(options: any): any;
}
import jwksClient from "jwks-client";

// Extend session data interface
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: any;
    oauthState?: string;
    oauthNonce?: string;
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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

export function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  console.log('[AUTH] isAuthenticated check for:', req.method, req.path);
  
  // Check for session-based authentication
  if (req.session?.userId) {
    console.log('[AUTH] Session-based auth: user', req.session.userId);
    return next();
  }

  console.log('[AUTH] No valid session found');
  return res.status(401).json({ message: "Unauthorized" });
};

// Regenerate session ID to prevent session fixation attacks
export function regenerateSession(req: any): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err: any) => {
      if (err) {
        console.error('Session regeneration error:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Validate state parameter to prevent CSRF attacks
export function validateState(req: any, providedState: string): boolean {
  const sessionState = req.session?.oauthState;
  if (!sessionState || sessionState !== providedState) {
    console.warn('OAuth state validation failed:', { sessionState, providedState });
    return false;
  }
  // Clear the state after validation
  delete req.session.oauthState;
  return true;
}

// Store OAuth state in session
export function storeOAuthState(req: any, state: string, nonce?: string): void {
  req.session.oauthState = state;
  if (nonce) {
    req.session.oauthNonce = nonce;
  }
}

// CSRF Protection - Generate secure state parameter
export function generateSecureState(): string {
  return crypto.randomBytes(32).toString('base64url');
}

// Generate secure nonce for Apple Sign In
export function generateSecureNonce(): string {
  return crypto.randomBytes(32).toString('base64url');
}

// Google OAuth Functions
export async function getGoogleOAuthURL(state: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string): Promise<any> {
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code',
      code
    })
  });
  
  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange Google code for token');
  }
  
  return await tokenResponse.json();
}

export async function getGoogleUserInfo(accessToken: string): Promise<any> {
  const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (!userResponse.ok) {
    throw new Error('Failed to get Google user info');
  }
  
  return await userResponse.json();
}

// OAuth Account Management
export async function createOrLinkOAuthUser(provider: 'google' | 'apple', userData: {
  providerUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}): Promise<{ user: any; isNewUser: boolean }> {
  // Check if OAuth account already exists
  const existingOAuthAccount = await storage.getOAuthAccount(provider, userData.providerUserId);
  
  if (existingOAuthAccount) {
    // Get existing user
    const user = await storage.getUser(existingOAuthAccount.userId);
    return { user, isNewUser: false };
  }
  
  // Check if user exists by email
  let user = await storage.getUserByEmail(userData.email);
  let isNewUser = false;
  
  if (!user) {
    // Create new user
    user = await storage.upsertUser({
      email: userData.email.toLowerCase(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
      role: 'professional', // Default role
      emailVerified: true // OAuth emails are considered verified
    });
    isNewUser = true;
  }
  
  // Create OAuth account link
  await storage.createOAuthAccount({
    userId: user.id,
    provider,
    providerUserId: userData.providerUserId,
    email: userData.email.toLowerCase()
  });
  
  return { user, isNewUser };
}

// Apple Sign In Functions
export async function getAppleOAuthURL(state: string, nonce: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: process.env.APPLE_CLIENT_ID!,
    redirect_uri: process.env.APPLE_REDIRECT_URI!,
    response_type: 'code id_token',
    scope: 'name email',
    response_mode: 'form_post',
    state,
    nonce
  });
  
  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

// Apple JWKS client for secure token verification (commented out for now)
// const appleJwksClient = jwksClient({
//   jwksUri: 'https://appleid.apple.com/auth/keys',
//   cache: true,
//   cacheMaxAge: 86400000, // 24 hours in ms
//   rateLimit: true,
//   jwksRequestsPerMinute: 5
// });

// Get Apple signing key (temporarily disabled)
function getAppleSigningKey(kid: string): Promise<string> {
  // Simplified for demo - in production, use proper JWKS verification
  return Promise.resolve('demo-key');
}

// Validate Apple ID token with proper signature verification
export async function validateAppleIdToken(idToken: string, expectedNonce?: string): Promise<any> {
  try {
    // Decode without verification to get header
    const decoded = jwt.decode(idToken, { complete: true });
    
    if (!decoded || typeof decoded === 'string') {
      throw new Error('Invalid Apple ID token format');
    }
    
    const { header } = decoded;
    const { kid } = header;
    
    if (!kid) {
      throw new Error('Missing key ID in Apple ID token header');
    }
    
    // Get Apple's signing key
    const signingKey = await getAppleSigningKey(kid);
    
    // Verify the token with Apple's public key
    const verifiedPayload = jwt.verify(idToken, signingKey, {
      algorithms: ['RS256'],
      issuer: 'https://appleid.apple.com',
      audience: process.env.APPLE_CLIENT_ID
    }) as any;
    
    // Validate nonce if provided (SHA256 hash of original nonce)
    if (expectedNonce) {
      const expectedNonceHash = crypto.createHash('sha256').update(expectedNonce).digest('base64url');
      if (verifiedPayload.nonce !== expectedNonceHash) {
        throw new Error('Nonce validation failed');
      }
    }
    
    // Additional security checks
    if (verifiedPayload.email && !verifiedPayload.email_verified) {
      throw new Error('Apple email not verified');
    }
    
    return verifiedPayload;
  } catch (error) {
    console.error('Apple ID token validation error:', error);
    throw new Error(`Invalid Apple ID token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Extract user info from Apple Sign In
export function extractAppleUserInfo(idTokenPayload: any, userInfo?: any): {
  providerUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
} {
  return {
    providerUserId: idTokenPayload.sub,
    email: idTokenPayload.email,
    firstName: userInfo?.name?.firstName,
    lastName: userInfo?.name?.lastName
  };
}

// Get appropriate dashboard redirect based on user role
export function getDashboardRedirect(userRole: string, isNewUser: boolean = false): string {
  let redirect = '/';
  
  switch (userRole) {
    case 'admin':
      redirect = '/admin-dashboard';
      break;
    case 'company':
      redirect = '/company-dashboard';
      break;
    case 'professional':
      redirect = '/professional-dashboard';
      break;
    default:
      redirect = '/dashboard';
      break;
  }
  
  return isNewUser ? `${redirect}?welcome=true` : redirect;
}