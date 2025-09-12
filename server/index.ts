import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import { sql } from "drizzle-orm";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Ensure authentication schema is set up before starting the server
  async function ensureAuthSchema() {
    // Handle extension creation separately with error tolerance
    try {
      await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    } catch (error) {
      log('⚠ pgcrypto extension note: ' + (error instanceof Error ? error.message : String(error)));
    }

    // Handle enum type creation with error tolerance
    try {
      await db.execute(sql`CREATE TYPE oauth_provider AS ENUM ('google', 'apple')`);
    } catch (error) {
      // Type might already exist, which is fine
      if (!(error instanceof Error && error.message?.includes('already exists'))) {
        log('⚠ oauth_provider type note: ' + (error instanceof Error ? error.message : String(error)));
      }
    }

    const statements = [
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash varchar`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token varchar`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires timestamp`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token varchar`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires timestamp`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamp`,
      sql`CREATE TABLE IF NOT EXISTS oauth_accounts (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider oauth_provider NOT NULL,
        provider_user_id varchar NOT NULL,
        email varchar,
        refresh_token_hash varchar,
        expires_at timestamp,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )`,
      sql`CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users (lower(email)) WHERE email IS NOT NULL`,
      sql`CREATE UNIQUE INDEX IF NOT EXISTS oauth_provider_account_unique_idx ON oauth_accounts (provider, provider_user_id)`,
      sql`CREATE UNIQUE INDEX IF NOT EXISTS oauth_user_provider_unique_idx ON oauth_accounts (user_id, provider)`,
      sql`CREATE INDEX IF NOT EXISTS oauth_user_id_idx ON oauth_accounts (user_id)`,
      sql`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_unique`
    ];

    for (let i = 0; i < statements.length; i++) {
      try {
        await db.execute(statements[i]);
      } catch (error) {
        log('✗ Schema statement failed: ' + (error instanceof Error ? error.message : String(error)));
        throw error;
      }
    }
  }

  try {
    await ensureAuthSchema();
    log('✓ Auth schema ensured successfully');
    
    // Startup diagnostics
    const codeMarker = '2025-09-12T20:15Z-1';
    const dbUrl = process.env.DATABASE_URL || '';
    const dbHost = dbUrl.match(/\/\/.*?@([^\/]+)\//)?.[1] || 'unknown';
    const dbName = dbUrl.match(/\/\/.*?@[^\/]+\/([^?]+)/)?.[1] || 'unknown';
    log(`[STARTUP] marker:${codeMarker} db:${dbHost}/${dbName}`);
  } catch (error) {
    log('✗ Auth schema setup failed: ' + (error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }

  const server = await registerRoutes(app);

  // Ensure API routes that don't exist return JSON 404 instead of HTML
  app.use('/api', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
