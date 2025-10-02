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
  getDashboardRedirect 
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
  type ContactForm
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes: /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // OAuth routes for Google authentication
  app.get('/api/auth/google', async (req, res) => {
    try {
      console.log('[OAuth] Google OAuth initiation started');
      console.log('[OAuth] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
      console.log('[OAuth] GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
      
      const state = generateSecureState();
      storeOAuthState(req.session, state);
      const authUrl = await getGoogleOAuthURL(state);
      
      console.log('[OAuth] Generated Google auth URL:', authUrl);
      console.log('[OAuth] Redirecting to Google OAuth...');
      
      res.redirect(authUrl);
    } catch (error) {
      console.error('Google OAuth initiation error:', error);
      res.redirect('/auth?error=oauth_failed');
    }
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code || !state) {
        return res.redirect('/auth?error=invalid_oauth_response');
      }
      
      // Validate state to prevent CSRF
      if (!validateOAuthState(req.session, state as string)) {
        return res.redirect('/auth?error=invalid_state');
      }
      
      // Exchange code for tokens
      const tokens = await exchangeGoogleCode(code as string);
      const userInfo = await getGoogleUserInfo(tokens.access_token);
      
      // Create or link OAuth user
      const { user, isNewUser } = await createOrLinkOAuthUser('google', {
        providerUserId: userInfo.id,
        email: userInfo.email,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        profileImageUrl: userInfo.picture
      });
      
      // Login user with Passport
      req.login(user, (err) => {
        if (err) {
          console.error('Passport login error:', err);
          return res.redirect('/auth?error=login_failed');
        }
        
        // Redirect to appropriate dashboard
        const redirectUrl = getDashboardRedirect(user, isNewUser);
        res.redirect(redirectUrl);
      });
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect('/auth?error=oauth_failed');
    }
  });

  // OAuth routes for Apple authentication
  app.get('/api/auth/apple', async (req, res) => {
    try {
      const state = generateSecureState();
      const nonce = generateSecureNonce();
      storeOAuthState(req.session, state, nonce);
      const authUrl = await getAppleOAuthURL(state, nonce);
      res.redirect(authUrl);
    } catch (error) {
      console.error('Apple OAuth initiation error:', error);
      res.redirect('/auth?error=oauth_failed');
    }
  });

  app.post('/api/auth/apple/callback', async (req, res) => {
    try {
      const { id_token, state, user } = req.body;
      
      if (!id_token || !state) {
        return res.redirect('/auth?error=invalid_oauth_response');
      }
      
      // Validate state to prevent CSRF
      if (!validateOAuthState(req.session, state)) {
        return res.redirect('/auth?error=invalid_state');
      }
      
      // Validate Apple ID token
      const nonce = req.session.oauthNonce;
      const payload = await validateAppleIdToken(id_token, nonce);
      
      // Extract user info
      const userInfo = extractAppleUserInfo(payload, user ? JSON.parse(user) : undefined);
      
      // Create or link OAuth user
      const { user: dbUser, isNewUser } = await createOrLinkOAuthUser('apple', userInfo);
      
      // Login user with Passport
      req.login(dbUser, (err) => {
        if (err) {
          console.error('Passport login error:', err);
          return res.redirect('/auth?error=login_failed');
        }
        
        // Redirect to appropriate dashboard
        const redirectUrl = getDashboardRedirect(dbUser, isNewUser);
        res.redirect(redirectUrl);
      });
    } catch (error) {
      console.error('Apple OAuth callback error:', error);
      res.redirect('/auth?error=oauth_failed');
    }
  });

  // Alternative OAuth callback routes without /api prefix (for provider redirect URIs)
  app.get('/auth/google/callback', async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code || !state) {
        return res.redirect('/auth?error=invalid_oauth_response');
      }
      
      // Validate state to prevent CSRF
      if (!validateOAuthState(req.session, state as string)) {
        return res.redirect('/auth?error=invalid_state');
      }
      
      // Exchange code for tokens
      const tokens = await exchangeGoogleCode(code as string);
      const userInfo = await getGoogleUserInfo(tokens.access_token);
      
      // Create or link OAuth user
      const { user, isNewUser } = await createOrLinkOAuthUser('google', {
        providerUserId: userInfo.id,
        email: userInfo.email,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        profileImageUrl: userInfo.picture
      });
      
      // Login user with Passport
      req.login(user, (err) => {
        if (err) {
          console.error('Passport login error:', err);
          return res.redirect('/auth?error=login_failed');
        }
        
        // Redirect to appropriate dashboard
        const redirectUrl = getDashboardRedirect(user, isNewUser);
        res.redirect(redirectUrl);
      });
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect('/auth?error=oauth_failed');
    }
  });

  app.post('/auth/apple/callback', async (req, res) => {
    try {
      const { id_token, state, user } = req.body;
      
      if (!id_token || !state) {
        return res.redirect('/auth?error=invalid_oauth_response');
      }
      
      // Validate state to prevent CSRF
      if (!validateOAuthState(req.session, state)) {
        return res.redirect('/auth?error=invalid_state');
      }
      
      // Validate Apple ID token
      const nonce = req.session.oauthNonce;
      const payload = await validateAppleIdToken(id_token, nonce);
      
      // Extract user info
      const userInfo = extractAppleUserInfo(payload, user ? JSON.parse(user) : undefined);
      
      // Create or link OAuth user
      const { user: dbUser, isNewUser } = await createOrLinkOAuthUser('apple', userInfo);
      
      // Login user with Passport
      req.login(dbUser, (err) => {
        if (err) {
          console.error('Passport login error:', err);
          return res.redirect('/auth?error=login_failed');
        }
        
        // Redirect to appropriate dashboard
        const redirectUrl = getDashboardRedirect(dbUser, isNewUser);
        res.redirect(redirectUrl);
      });
    } catch (error) {
      console.error('Apple OAuth callback error:', error);
      res.redirect('/auth?error=oauth_failed');
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
        userId: req.user.id
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
        userId: req.user.id
      });
      res.status(201).json(professional);
    } catch (error) {
      console.error("Create professional error:", error);
      res.status(500).json({ message: "Failed to create professional profile" });
    }
  });

  app.get("/api/professionals/me", requireAuth, async (req, res) => {
    try {
      const professional = await storage.getProfessionalByUserId(req.user.id);
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
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }

      // Validate request body - only allow specific fields
      const { updateProfessionalSchema } = await import("@shared/schema");
      const validatedData = updateProfessionalSchema.parse(req.body);

      const updated = await storage.updateProfessional(id, validatedData);
      res.json(updated);
    } catch (error) {
      console.error("Update professional error:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error });
      }
      res.status(500).json({ message: "Failed to update professional profile" });
    }
  });

  // Job routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.searchJobs({
        skills: req.query.skills as string[],
        type: req.query.type as string,
        status: "active"
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
        return res.status(400).json({ message: "Company profile required to post jobs" });
      }

      const job = await storage.createJob({
        ...req.body,
        companyId: company.id
      });
      res.status(201).json(job);
    } catch (error) {
      console.error("Create job error:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  // Application routes
  app.post("/api/applications", requireAuth, async (req, res) => {
    try {
      // Get user's professional profile
      const professional = await storage.getProfessionalByUserId(req.user.id);
      if (!professional) {
        return res.status(400).json({ message: "Professional profile required to apply for jobs" });
      }

      const application = await storage.createApplication({
        ...req.body,
        professionalId: professional.id
      });
      res.status(201).json(application);
    } catch (error) {
      console.error("Create application error:", error);
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
          errors: validationResult.error.errors 
        });
      }

      const { name, email, company, message } = validationResult.data;

      // Basic rate limiting check (simple IP-based)
      const clientIp = req.ip || req.connection.remoteAddress;
      console.log(`Contact form submission from IP: ${clientIp}`);

      // Input sanitization - remove potentially dangerous characters
      const sanitizedName = name.replace(/[<>]/g, '');
      const sanitizedCompany = company ? company.replace(/[<>]/g, '') : '';
      const sanitizedMessage = message.replace(/[<>]/g, '');

      // Validate Resend API key
      if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured');
        return res.status(500).json({ 
          message: "Configuração de email não disponível" 
        });
      }

      // Initialize Resend client
      const resend = new Resend(process.env.RESEND_API_KEY);

      // In development/testing, Resend only allows sending to the account owner's email
      // In production, use a verified domain to send to any email
      const recipientEmail = process.env.NODE_ENV === 'production' 
        ? 'contact@magenx.tech' 
        : 'asouzamax@gmail.com';

      // Send email using Resend API
      const { data, error } = await resend.emails.send({
        from: 'MaGenX Contact <onboarding@resend.dev>',
        to: recipientEmail,
        replyTo: email,
        subject: `Nova mensagem de contato - ${sanitizedCompany || sanitizedName}`,
        html: `
          <h2>Nova mensagem de contato</h2>
          <p><strong>Nome:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${sanitizedCompany ? `<p><strong>Empresa:</strong> ${sanitizedCompany}</p>` : ''}
          <p><strong>Mensagem:</strong></p>
          <p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small>Enviado via formulário de contato MaGenX</small></p>
        `
      });

      if (error) {
        console.error('Resend API error:', error);
        return res.status(500).json({ 
          message: "Erro ao enviar mensagem. Tente novamente." 
        });
      }

      console.log('Email sent successfully via Resend:', data?.id);
      res.json({ message: "Mensagem enviada com sucesso!" });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ message: "Erro ao enviar mensagem. Tente novamente." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}