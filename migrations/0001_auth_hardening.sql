-- Auth System Hardening Migration
-- Adds security constraints and indexes for the new authentication system

-- Ensure UUID support is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add authentication fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash varchar;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token varchar;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires timestamp;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token varchar;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires timestamp;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamp;

-- Create OAuth accounts table
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider varchar NOT NULL,
  provider_user_id varchar NOT NULL,
  email varchar,
  refresh_token_hash varchar,
  expires_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Add critical security indexes and constraints

-- Case-insensitive unique email index for users
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx 
ON users (lower(email)) 
WHERE email IS NOT NULL;

-- Prevent duplicate provider accounts
CREATE UNIQUE INDEX IF NOT EXISTS oauth_provider_account_unique_idx 
ON oauth_accounts (provider, provider_user_id);

-- Prevent multiple accounts from same provider for one user
CREATE UNIQUE INDEX IF NOT EXISTS oauth_user_provider_unique_idx 
ON oauth_accounts (user_id, provider);

-- Performance index for user lookups
CREATE INDEX IF NOT EXISTS oauth_user_id_idx 
ON oauth_accounts (user_id);

-- Drop old unique constraint on email if it exists (case-sensitive)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_unique;