// Server routes using blueprint:javascript_auth_all_persistance
import type { Express } from "express";
import { createServer, type Server } from "http";
import { Resend } from "resend";
import { setupAuth } from "./auth";
import {
  getGoogleOAuthURL,
  exchangeGoogleCode,
  getGoogleUserInfo,
  getAppleOAuthURL,
  validateAppleIdToken,
  extractAppleUserInfo,
  createOrLinkOAuthUser,
  generateSecureState,
  generateSecureNonce,
  storeOAuthState,
  validateOAuthState,
  validateOAuthNonce,
  getDashboardRedirect,
  processPendingJobApplication,
} from "./replitAuth";
import { storage } from "./storage";
import { db } from "./db";
import {
  jobs,
  companies,
  professionals,
  applications,
  contracts,
  notifications,
  contactFormSchema,
  type InsertJob,
  type InsertCompany,
  type InsertProfessional,
  type InsertApplication,
  type InsertContract,
  type InsertNotification,
  type ContactForm,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes: /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // OAuth routes for Google authentication
  app.get("/api/auth/google", async (req, res) => {
    try {
      console.log("[OAuth] Google OAuth initiation started");
      console.log(
        "[OAuth] GOOGLE_CLIENT_ID:",
        process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET",
      );
      console.log(
        "[OAuth] GOOGLE_REDIRECT_URI:",
        process.env.GOOGLE_REDIRECT_URI,
      );

      const state = generateSecureState();
      storeOAuthState(req.session, state);

      // Store pending job ID and return URL if provided
      const jobId = req.query.jobId as string;
      const returnUrl = req.query.returnUrl as string;
      if (jobId) {
        req.session.pendingJobId = jobId;
        console.log("[OAuth] Storing pending job ID:", jobId);
      }
      if (returnUrl) {
        req.session.returnUrl = returnUrl;
        console.log("[OAuth] Storing return URL:", returnUrl);
      }

      // Save session explicitly before redirect (critical for OAuth flow)
      req.session.save(async (err) => {
        if (err) {
          console.error("[Google OAuth Init] Session save error:", err);
          return res.redirect("/auth?error=session_failed");
        }

        try {
          const authUrl = await getGoogleOAuthURL(state);
          console.log("[OAuth] Generated Google auth URL:", authUrl);
          console.log("[OAuth] Redirecting to Google OAuth...");
          res.redirect(authUrl);
        } catch (error) {
          console.error("Google OAuth URL generation error:", error);
          res.redirect("/auth?error=oauth_failed");
        }
      });
    } catch (error) {
      console.error("Google OAuth initiation error:", error);
      res.redirect("/auth?error=oauth_failed");
    }
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    try {
      const { code, state } = req.query;

      if (!code || !state) {
        return res.redirect("/auth?error=invalid_oauth_response");
      }

      // Validate state to prevent CSRF
      if (!validateOAuthState(req.session, state as string)) {
        return res.redirect("/auth?error=invalid_state");
      }

      // Exchange code for tokens
      const tokens = await exchangeGoogleCode(code as string);
      const userInfo = await getGoogleUserInfo(tokens.access_token);

      // Create or link OAuth user
      const { user, isNewUser } = await createOrLinkOAuthUser("google", {
        providerUserId: userInfo.id,
        email: userInfo.email,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        profileImageUrl: userInfo.picture,
      });

      // Login user with Passport
      req.login(user, async (err) => {
        if (err) {
          console.error("Passport login error:", err);
          return res.redirect("/auth?error=login_failed");
        }

        // Process any pending job application
        const { jobId, returnUrl } = await processPendingJobApplication(
          req.session,
          user.id,
        );

        // Save session after processing
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("[Google OAuth] Session save error:", saveErr);
          }

          // Determine redirect URL
          let redirectUrl: string;
          if (returnUrl) {
            redirectUrl = returnUrl;
            console.log("[Google OAuth] Using stored return URL:", redirectUrl);
          } else {
            redirectUrl = getDashboardRedirect(user, isNewUser);
          }

          // If job was applied, add success parameter
          if (jobId) {
            const separator = redirectUrl.includes("?") ? "&" : "?";
            redirectUrl = `${redirectUrl}${separator}jobApplied=${jobId}`;
          }

          res.redirect(redirectUrl);
        });
      });
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      res.redirect("/auth?error=oauth_failed");
    }
  });

  // OAuth routes for Apple authentication
  app.get("/api/auth/apple", async (req, res) => {
    try {
      const state = generateSecureState();
      const nonce = generateSecureNonce();
      storeOAuthState(req.session, state, nonce);

      // Store pending job ID and return URL if provided
      const jobId = req.query.jobId as string;
      const returnUrl = req.query.returnUrl as string;
      if (jobId) {
        req.session.pendingJobId = jobId;
        console.log("[Apple OAuth Init] Storing pending job ID:", jobId);
      }
      if (returnUrl) {
        req.session.returnUrl = returnUrl;
        console.log("[Apple OAuth Init] Storing return URL:", returnUrl);
      }

      console.log("[Apple OAuth Init] Storing state and nonce in session:", {
        sessionID: req.sessionID,
        state: state.substring(0, 10) + "...",
        nonce: nonce.substring(0, 10) + "...",
      });

      // Save session explicitly before redirect (critical for OAuth flow)
      req.session.save((err) => {
        if (err) {
          console.error("[Apple OAuth Init] Session save error:", err);
          return res.redirect("/auth?error=session_failed");
        }

        console.log("[Apple OAuth Init] Session saved, redirecting to Apple");
        getAppleOAuthURL(state, nonce)
          .then((authUrl) => {
            res.redirect(authUrl);
          })
          .catch((error) => {
            console.error("[Apple OAuth Init] URL generation error:", error);
            res.redirect("/auth?error=oauth_failed");
          });
      });
    } catch (error) {
      console.error("Apple OAuth initiation error:", error);
      res.redirect("/auth?error=oauth_failed");
    }
  });

  app.post("/api/auth/apple/callback", async (req, res) => {
    console.log("[Apple OAuth] Callback received");
    console.log(
      "[Apple OAuth] Body:",
      JSON.stringify(req.body).substring(0, 200),
    );
    console.log("[Apple OAuth] Session ID:", req.sessionID);
    console.log("[Apple OAuth] Session state:", req.session?.oauthState);

    try {
      const { id_token, state, user } = req.body;

      if (!id_token || !state) {
        console.error("[Apple OAuth] Missing id_token or state");
        return res.redirect("/auth?error=invalid_oauth_response");
      }

      console.log("[Apple OAuth] Validating state...");
      // Validate state to prevent CSRF
      if (!validateOAuthState(req.session, state)) {
        console.error("[Apple OAuth] State validation failed");
        return res.redirect("/auth?error=invalid_state");
      }

      console.log("[Apple OAuth] State validated, validating token...");
      // Validate Apple ID token
      const nonce = req.session.oauthNonce;
      const payload = await validateAppleIdToken(id_token, nonce);

      console.log("[Apple OAuth] Token validated, extracting user info...");
      // Extract user info
      const userInfo = extractAppleUserInfo(
        payload,
        user ? JSON.parse(user) : undefined,
      );
      console.log("[Apple OAuth] User info:", userInfo.email);

      console.log("[Apple OAuth] Creating/linking user...");
      // Create or link OAuth user
      const { user: dbUser, isNewUser } = await createOrLinkOAuthUser(
        "apple",
        userInfo,
      );
      console.log("[Apple OAuth] User created/linked, role:", dbUser.role);

      // Login user with Passport
      req.login(dbUser, async (err) => {
        if (err) {
          console.error("[Apple OAuth] Passport login error:", err);
          return res.redirect("/auth?error=login_failed");
        }

        console.log("[Apple OAuth] User logged in successfully");

        // Process any pending job application
        const { jobId, returnUrl } = await processPendingJobApplication(
          req.session,
          dbUser.id,
        );

        // Save session explicitly before redirect (important for mobile OAuth)
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("[Apple OAuth] Session save error:", saveErr);
            return res.redirect("/auth?error=session_failed");
          }

          // Determine redirect URL
          let redirectUrl: string;
          if (returnUrl) {
            redirectUrl = returnUrl;
            console.log("[Apple OAuth] Using stored return URL:", redirectUrl);
          } else {
            redirectUrl = getDashboardRedirect(dbUser, isNewUser);
          }

          // If job was applied, add success parameter
          if (jobId) {
            const separator = redirectUrl.includes("?") ? "&" : "?";
            redirectUrl = `${redirectUrl}${separator}jobApplied=${jobId}`;
          }

          console.log("[Apple OAuth] Redirecting to:", redirectUrl);
          res.redirect(redirectUrl);
        });
      });
    } catch (error) {
      console.error("[Apple OAuth] Callback error:", error);
      console.error("[Apple OAuth] Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      });
      res.redirect("/auth?error=oauth_failed");
    }
  });

  // Alternative OAuth callback routes without /api prefix (for provider redirect URIs)
  app.get("/auth/google/callback", async (req, res) => {
    try {
      const { code, state } = req.query;

      if (!code || !state) {
        return res.redirect("/auth?error=invalid_oauth_response");
      }

      // Validate state to prevent CSRF
      if (!validateOAuthState(req.session, state as string)) {
        return res.redirect("/auth?error=invalid_state");
      }

      // Exchange code for tokens
      const tokens = await exchangeGoogleCode(code as string);
      const userInfo = await getGoogleUserInfo(tokens.access_token);

      // Create or link OAuth user
      const { user, isNewUser } = await createOrLinkOAuthUser("google", {
        providerUserId: userInfo.id,
        email: userInfo.email,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        profileImageUrl: userInfo.picture,
      });

      // Login user with Passport
      req.login(user, async (err) => {
        if (err) {
          console.error("Passport login error:", err);
          return res.redirect("/auth?error=login_failed");
        }

        // Process any pending job application
        const { jobId, returnUrl } = await processPendingJobApplication(
          req.session,
          user.id,
        );

        // Save session after processing
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("[Google OAuth ALT] Session save error:", saveErr);
          }

          // Determine redirect URL
          let redirectUrl: string;
          if (returnUrl) {
            redirectUrl = returnUrl;
          } else {
            redirectUrl = getDashboardRedirect(user, isNewUser);
          }

          // If job was applied, add success parameter
          if (jobId) {
            const separator = redirectUrl.includes("?") ? "&" : "?";
            redirectUrl = `${redirectUrl}${separator}jobApplied=${jobId}`;
          }

          res.redirect(redirectUrl);
        });
      });
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      res.redirect("/auth?error=oauth_failed");
    }
  });

  app.post("/auth/apple/callback", async (req, res) => {
    console.log("[Apple OAuth ALT] Callback received (no /api prefix)");
    console.log(
      "[Apple OAuth ALT] Body:",
      JSON.stringify(req.body).substring(0, 200),
    );
    console.log("[Apple OAuth ALT] Session ID:", req.sessionID);
    console.log("[Apple OAuth ALT] Session state:", req.session?.oauthState);

    try {
      const { id_token, state, user } = req.body;

      if (!id_token || !state) {
        console.error("[Apple OAuth ALT] Missing id_token or state");
        return res.redirect("/auth?error=invalid_oauth_response");
      }

      console.log("[Apple OAuth ALT] Validating state...");
      // Validate state to prevent CSRF
      if (!validateOAuthState(req.session, state)) {
        console.error("[Apple OAuth ALT] State validation failed");
        return res.redirect("/auth?error=invalid_state");
      }

      console.log("[Apple OAuth ALT] State validated, validating token...");
      // Validate Apple ID token
      const nonce = req.session.oauthNonce;
      const payload = await validateAppleIdToken(id_token, nonce);

      console.log("[Apple OAuth ALT] Token validated, extracting user info...");
      // Extract user info
      const userInfo = extractAppleUserInfo(
        payload,
        user ? JSON.parse(user) : undefined,
      );
      console.log("[Apple OAuth ALT] User info:", userInfo.email);

      console.log("[Apple OAuth ALT] Creating/linking user...");
      // Create or link OAuth user
      const { user: dbUser, isNewUser } = await createOrLinkOAuthUser(
        "apple",
        userInfo,
      );
      console.log("[Apple OAuth ALT] User created/linked, role:", dbUser.role);

      // Login user with Passport
      req.login(dbUser, async (err) => {
        if (err) {
          console.error("[Apple OAuth ALT] Passport login error:", err);
          return res.redirect("/auth?error=login_failed");
        }

        console.log("[Apple OAuth ALT] User logged in successfully");

        // Process any pending job application
        const { jobId, returnUrl } = await processPendingJobApplication(
          req.session,
          dbUser.id,
        );

        // Save session explicitly before redirect (important for mobile OAuth)
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("[Apple OAuth ALT] Session save error:", saveErr);
            return res.redirect("/auth?error=session_failed");
          }

          console.log("[Apple OAuth ALT] Session saved, redirecting...");

          // Determine redirect URL
          let redirectUrl: string;
          if (returnUrl) {
            redirectUrl = returnUrl;
          } else {
            redirectUrl = getDashboardRedirect(dbUser, isNewUser);
          }

          // If job was applied, add success parameter
          if (jobId) {
            const separator = redirectUrl.includes("?") ? "&" : "?";
            redirectUrl = `${redirectUrl}${separator}jobApplied=${jobId}`;
          }

          console.log("[Apple OAuth ALT] Redirecting to:", redirectUrl);
          res.redirect(redirectUrl);
        });
      });
    } catch (error) {
      console.error("Apple OAuth callback error:", error);
      res.redirect("/auth?error=oauth_failed");
    }
  });

  // Middleware to check authentication for protected routes
  function requireAuth(req: any, res: any, next: any) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  }

  // Company routes
  app.post("/api/companies", requireAuth, async (req, res) => {
    try {
      const company = await storage.createCompany({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).json(company);
    } catch (error) {
      console.error("Create company error:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.get("/api/companies/me", requireAuth, async (req, res) => {
    try {
      const company = await storage.getCompanyByUserId(req.user.id);
      if (!company) {
        return res.status(404).json({ message: "Company profile not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Get company error:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  // Professional routes
  app.post("/api/professionals", requireAuth, async (req, res) => {
    try {
      const professional = await storage.createProfessional({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).json(professional);
    } catch (error) {
      console.error("Create professional error:", error);
      res
        .status(500)
        .json({ message: "Failed to create professional profile" });
    }
  });

  app.get("/api/professionals/me", requireAuth, async (req, res) => {
    try {
      const professional = await storage.getProfessionalByUserId(req.user.id);
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }
      res.json(professional);
    } catch (error) {
      console.error("Get professional error:", error);
      res.status(500).json({ message: "Failed to fetch professional profile" });
    }
  });

  app.patch("/api/professionals/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;

      // Verify ownership
      const professional = await storage.getProfessional(id);
      if (!professional || professional.userId !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this profile" });
      }

      // Validate request body - only allow specific fields
      const { updateProfessionalSchema } = await import("@shared/schema");
      const validatedData = updateProfessionalSchema.parse(req.body);

      const updated = await storage.updateProfessional(id, validatedData);
      res.json(updated);
    } catch (error) {
      console.error("Update professional error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res
          .status(400)
          .json({ message: "Invalid request data", errors: error });
      }
      res
        .status(500)
        .json({ message: "Failed to update professional profile" });
    }
  });

  // Job routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.searchJobs({
        skills: req.query.skills as string[],
        type: req.query.type as string,
        status: "active",
      });
      res.json(jobs);
    } catch (error) {
      console.error("Get jobs error:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post("/api/jobs", requireAuth, async (req, res) => {
    try {
      // Get user's company
      const company = await storage.getCompanyByUserId(req.user.id);
      if (!company) {
        return res
          .status(400)
          .json({ message: "Company profile required to post jobs" });
      }

      const job = await storage.createJob({
        ...req.body,
        companyId: company.id,
      });
      res.status(201).json(job);
    } catch (error) {
      console.error("Create job error:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  // Application routes
  app.get("/api/applications/my", requireAuth, async (req, res) => {
    try {
      const professional = await storage.getProfessionalByUserId(req.user.id);
      if (!professional) {
        return res
          .status(404)
          .json({ message: "Professional profile not found" });
      }

      const applications = await storage.getApplicationsByProfessional(
        professional.id,
      );

      const applicationsWithJobs = await Promise.all(
        applications.map(async (app) => {
          const job = await storage.getJob(app.jobId);
          const company = job ? await storage.getCompany(job.companyId) : null;
          return {
            ...app,
            job: job
              ? {
                  id: job.id,
                  title: job.title,
                  description: job.description,
                  type: job.type,
                  budget: job.budget,
                  company: company
                    ? {
                        id: company.id,
                        name: company.name,
                      }
                    : null,
                }
              : null,
          };
        }),
      );

      res.json(applicationsWithJobs);
    } catch (error) {
      console.error("Get applications error:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", requireAuth, async (req, res) => {
    try {
      // Get user's professional profile
      const professional = await storage.getProfessionalByUserId(req.user.id);
      if (!professional) {
        return res
          .status(400)
          .json({ message: "Professional profile required to apply for jobs" });
      }

      const application = await storage.createApplication({
        ...req.body,
        professionalId: professional.id,
      });
      res.status(201).json(application);
    } catch (error) {
      console.error("Create application error:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  // Apply for a job - handles both authenticated and unauthenticated users
  app.post("/api/jobs/:jobId/apply", async (req, res) => {
    try {
      const { jobId } = req.params;

      // Check if user is authenticated
      if (!req.isAuthenticated() || !req.user) {
        // Store job ID in session and redirect to OAuth
        console.log(
          "[Apply Job] User not authenticated, storing job ID and redirecting to auth",
        );
        req.session.pendingJobId = jobId;
        req.session.returnUrl = "/professional";

        // Save session before responding
        req.session.save((err) => {
          if (err) {
            console.error("[Apply Job] Session save error:", err);
            return res.status(500).json({
              message: "Session error",
              requiresAuth: true,
              redirectUrl: "/auth",
            });
          }

          return res.status(401).json({
            message: "Authentication required",
            requiresAuth: true,
            redirectUrl: "/auth",
          });
        });
        return;
      }

      // User is authenticated, check for professional profile
      const professional = await storage.getProfessionalByUserId(req.user.id);
      if (!professional) {
        return res.status(400).json({
          message: "Professional profile required to apply for jobs",
          requiresProfile: true,
        });
      }

      // Check if already applied
      const existingApp = await storage.getApplicationByJobAndProfessional(
        jobId,
        professional.id,
      );
      if (existingApp) {
        return res.status(400).json({
          message: "You have already applied to this job",
          alreadyApplied: true,
        });
      }

      // Create application
      const application = await storage.createApplication({
        jobId,
        professionalId: professional.id,
        status: "pending",
      });

      console.log(
        "[Apply Job] Application created successfully:",
        application.id,
      );
      res.status(201).json(application);
    } catch (error) {
      console.error("[Apply Job] Error:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  // Notification routes
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.user.id);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const notification = await storage.markNotificationRead(req.params.id);
      res.json(notification);
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Contact form endpoint with validation and security
  app.post("/api/contact", async (req, res) => {
    try {
      // Validate request body using shared schema
      const validationResult = contactFormSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          message: "Dados inválidos",
          errors: validationResult.error.errors,
        });
      }

      const { name, email, company, message } = validationResult.data;

      // Basic rate limiting check (simple IP-based)
      const clientIp = req.ip || req.connection.remoteAddress;
      console.log(`Contact form submission from IP: ${clientIp}`);

      // Input sanitization - remove potentially dangerous characters
      const sanitizedName = name.replace(/[<>]/g, "");
      const sanitizedCompany = company ? company.replace(/[<>]/g, "") : "";
      const sanitizedMessage = message.replace(/[<>]/g, "");

      // Validate Resend API key
      if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY not configured");
        return res.status(500).json({
          message: "Configuração de email não disponível",
        });
      }

      // Initialize Resend client
      const resend = new Resend(process.env.RESEND_API_KEY);

      // In development/testing, Resend only allows sending to the account owner's email
      // In production, use a verified domain to send to any email
      const recipientEmail =
        process.env.NODE_ENV === "production"
          ? "contact@magenx.tech"
          : "asouzamax@gmail.com";

      // Send email using Resend API
      const { data, error } = await resend.emails.send({
        from: "MaGenX Contact <onboarding@resend.dev>",
        to: recipientEmail,
        replyTo: email,
        subject: `Nova mensagem de contato - ${sanitizedCompany || sanitizedName}`,
        html: `
          <h2>Nova mensagem de contato</h2>
          <p><strong>Nome:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${sanitizedCompany ? `<p><strong>Empresa:</strong> ${sanitizedCompany}</p>` : ""}
          <p><strong>Mensagem:</strong></p>
          <p>${sanitizedMessage.replace(/\n/g, "<br>")}</p>
          <hr>
          <p><small>Enviado via formulário de contato MaGenX</small></p>
        `,
      });

      if (error) {
        console.error("Resend API error:", error);
        return res.status(500).json({
          message: "Erro ao enviar mensagem. Tente novamente.",
        });
      }

      console.log("Email sent successfully via Resend:", data?.id);
      res.json({ message: "Mensagem enviada com sucesso!" });
    } catch (error) {
      console.error("Contact form error:", error);
      res
        .status(500)
        .json({ message: "Erro ao enviar mensagem. Tente novamente." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
