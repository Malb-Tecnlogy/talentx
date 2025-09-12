import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import crypto from "crypto";
import jwt from "jsonwebtoken";

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

// Google OAuth Functions
export async function getGoogleOAuthURL(state?: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    ...(state && { state })
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
export async function getAppleOAuthURL(state?: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: process.env.APPLE_CLIENT_ID!,
    redirect_uri: process.env.APPLE_REDIRECT_URI!,
    response_type: 'code id_token',
    scope: 'name email',
    response_mode: 'form_post',
    ...(state && { state })
  });
  
  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

// Validate Apple ID token (simplified - in production, verify with Apple's public keys)
export async function validateAppleIdToken(idToken: string): Promise<any> {
  try {
    // In production, you should fetch and verify against Apple's public keys
    // For now, we'll decode without verification (NOT SECURE for production)
    const decoded = jwt.decode(idToken, { complete: true });
    
    if (!decoded || typeof decoded === 'string') {
      throw new Error('Invalid Apple ID token');
    }
    
    const payload = decoded.payload as any;
    
    // Basic validation
    if (payload.iss !== 'https://appleid.apple.com') {
      throw new Error('Invalid Apple ID token issuer');
    }
    
    if (payload.aud !== process.env.APPLE_CLIENT_ID) {
      throw new Error('Invalid Apple ID token audience');
    }
    
    // Check expiration
    if (Date.now() >= payload.exp * 1000) {
      throw new Error('Apple ID token expired');
    }
    
    return payload;
  } catch (error) {
    console.error('Apple ID token validation error:', error);
    throw new Error('Invalid Apple ID token');
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