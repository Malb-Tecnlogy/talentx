import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, getGoogleOAuthURL, exchangeGoogleCode, getGoogleUserInfo, createOrLinkOAuthUser, getAppleOAuthURL, validateAppleIdToken, extractAppleUserInfo, generateSecureState, generateSecureNonce, regenerateSession, validateState, storeOAuthState, getDashboardRedirect } from "./replitAuth";
import { initializeWebSocket, getWebSocketService } from "./websocket";
import { analyzeJobProfessionalMatch, generateJobRecommendations, analyzeProfessionalProfile } from "./openai";
import { insertJobSchema, insertApplicationSchema, insertCompanySchema, insertProfessionalSchema, insertContractSchema } from "@shared/schema";
import { z } from "zod";
// Import necessary database functions and schemas
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  const httpServer = createServer(app);

  // Initialize WebSocket
  initializeWebSocket(httpServer);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get role-specific data
      let roleData = null;
      if (user.role === 'company') {
        roleData = await storage.getCompanyByUserId(userId);
      } else if (user.role === 'professional') {
        roleData = await storage.getProfessionalByUserId(userId);
      }

      res.json({ ...user, roleData });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Login endpoint for email/password authentication
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user by email
      const userResult = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);

      if (userResult.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const foundUser = userResult[0];

      // Check password
      if (!foundUser.passwordHash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, foundUser.passwordHash);

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login
      await db.update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, foundUser.id));

      // Regenerate session to prevent session fixation
      await regenerateSession(req);
      
      // Create session
      (req.session as any).userId = foundUser.id;
      (req.session as any).user = {
        id: foundUser.id,
        email: foundUser.email,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        role: foundUser.role
      };

      res.json({
        message: "Login successful",
        user: (req.session as any).user
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout route
  app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Google OAuth routes
  app.get('/api/auth/google', async (req, res) => {
    try {
      // Generate secure state for CSRF protection
      const state = generateSecureState();
      
      // Store state in session for validation
      storeOAuthState(req.session as any, state);
      
      const authUrl = await getGoogleOAuthURL(state);
      res.redirect(authUrl);
    } catch (error) {
      console.error('Google OAuth initiation error:', error);
      res.status(500).json({ message: 'Failed to initiate Google authentication' });
    }
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    try {
      const { code, state, error: oauthError } = req.query;
      
      if (oauthError || !code) {
        console.error('Google OAuth error:', oauthError);
        return res.redirect('/login?error=oauth_failed');
      }
      
      // Validate CSRF state
      if (!state || !validateOAuthState(req.session as any, state as string)) {
        console.error('OAuth state validation failed');
        return res.redirect('/login?error=oauth_failed');
      }
      
      // Exchange code for tokens
      const tokens = await exchangeGoogleCode(code as string);
      
      // Get user info from Google
      const googleUser = await getGoogleUserInfo(tokens.access_token);
      
      // Create or link OAuth user
      const { user, isNewUser } = await createOrLinkOAuthUser('google', {
        providerUserId: googleUser.id,
        email: googleUser.email,
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        profileImageUrl: googleUser.picture
      });
      
      // Regenerate session to prevent fixation attacks
      await regenerateSession(req);
      
      // Update last login
      await db.update(users)
        .set({ lastLoginAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, user.id));
      
      // Create secure session
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      };
      
      // Redirect to correct dashboard based on role
      const redirectUrl = getDashboardRedirect(user, isNewUser);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect('/login?error=oauth_failed');
    }
  });

  // Apple Sign In routes
  app.get('/api/auth/apple', async (req, res) => {
    try {
      // Generate secure state and nonce for CSRF protection
      const state = generateSecureState();
      const nonce = generateSecureNonce();
      
      // Store state and nonce in session for validation
      storeOAuthState(req.session as any, state, nonce);
      
      const authUrl = await getAppleOAuthURL(state, nonce);
      res.redirect(authUrl);
    } catch (error) {
      console.error('Apple OAuth initiation error:', error);
      res.status(500).json({ message: 'Failed to initiate Apple authentication' });
    }
  });

  app.post('/api/auth/apple/callback', async (req, res) => {
    try {
      const { code, id_token, user: userString, state, error: oauthError } = req.body;
      
      if (oauthError || !id_token) {
        console.error('Apple OAuth error:', oauthError);
        return res.redirect('/login?error=oauth_failed');
      }
      
      // Validate CSRF state
      if (!state || !validateOAuthState(req.session as any, state)) {
        console.error('Apple OAuth state validation failed');
        return res.redirect('/login?error=oauth_failed');
      }
      
      // Get stored nonce for validation
      const storedNonce = (req.session as any).oauthNonce;
      
      // Validate Apple ID token with nonce
      const idTokenPayload = await validateAppleIdToken(id_token, storedNonce);
      
      // Clear stored nonce after use
      if ((req.session as any).oauthNonce) {
        delete (req.session as any).oauthNonce;
      }
      
      // Parse user info if provided (only on first sign in)
      let userInfo = null;
      if (userString) {
        try {
          userInfo = JSON.parse(userString);
        } catch (e) {
          console.warn('Failed to parse Apple user info:', e);
        }
      }
      
      // Extract user data
      const userData = extractAppleUserInfo(idTokenPayload, userInfo);
      
      // Create or link OAuth user
      const { user, isNewUser } = await createOrLinkOAuthUser('apple', userData);
      
      // Regenerate session to prevent fixation attacks
      await regenerateSession(req);
      
      // Update last login
      await db.update(users)
        .set({ lastLoginAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, user.id));
      
      // Create secure session
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      };
      
      // Redirect to correct dashboard based on role
      const redirectUrl = getDashboardRedirect(user, isNewUser);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Apple OAuth callback error:', error);
      res.redirect('/login?error=oauth_failed');
    }
  });

  // Company routes
  app.post('/api/companies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const companyData = insertCompanySchema.parse({ ...req.body, userId });

      const company = await storage.createCompany(companyData);

      // Update user role to company
      await storage.upsertUser({ id: userId, role: 'company' });

      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.get('/api/companies/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const company = await storage.getCompanyByUserId(userId);
      if (!company) {
        return res.status(404).json({ message: "Company profile not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  // Professional routes
  app.post('/api/professionals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const professionalData = insertProfessionalSchema.parse({ ...req.body, userId });

      const professional = await storage.createProfessional(professionalData);

      // Update user role to professional
      await storage.upsertUser({ id: userId, role: 'professional' });

      res.status(201).json(professional);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid professional data", errors: error.errors });
      }
      console.error("Error creating professional:", error);
      res.status(500).json({ message: "Failed to create professional" });
    }
  });

  app.get('/api/professionals/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const professional = await storage.getProfessionalByUserId(userId);
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }
      res.json(professional);
    } catch (error) {
      console.error("Error fetching professional:", error);
      res.status(500).json({ message: "Failed to fetch professional" });
    }
  });

  app.put('/api/professionals/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const professional = await storage.getProfessionalByUserId(userId);
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      const updatedProfessional = await storage.updateProfessional(professional.id, req.body);
      res.json(updatedProfessional);
    } catch (error) {
      console.error("Error updating professional:", error);
      res.status(500).json({ message: "Failed to update professional" });
    }
  });

  app.get('/api/professionals/search', isAuthenticated, async (req: any, res) => {
    try {
      const { skills, availability } = req.query;
      const searchQuery: { skills?: string[]; availability?: string } = {};

      if (skills) {
        searchQuery.skills = Array.isArray(skills) ? skills.map(s => String(s)) : String(skills).split(',');
      }
      if (availability) {
        searchQuery.availability = availability as string;
      }

      const professionals = await storage.searchProfessionals(searchQuery);
      res.json(professionals);
    } catch (error) {
      console.error("Error searching professionals:", error);
      res.status(500).json({ message: "Failed to search professionals" });
    }
  });

  // Job routes
  app.post('/api/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);

      if (user?.role !== 'company') {
        return res.status(403).json({ message: "Only companies can post jobs" });
      }

      const company = await storage.getCompanyByUserId(userId);
      if (!company) {
        return res.status(404).json({ message: "Company profile not found" });
      }

      const jobData = insertJobSchema.parse({
        ...req.body,
        companyId: company.id,
        status: 'pending_approval'
      });

      const job = await storage.createJob(jobData);

      // Notify admin about new job pending approval
      const wsService = getWebSocketService();
      wsService.sendToRole('admin', {
        type: 'notification',
        data: {
          title: 'New Job Pending Approval',
          message: `Job "${job.title}" by ${company.name} is pending approval`,
          jobId: job.id
        }
      });

      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.get('/api/jobs', async (req, res) => {
    try {
      const { skills, type, status = 'active' } = req.query;
      const searchQuery: { skills?: string[]; type?: string; status?: string } = { status: status as string };

      if (skills) {
        searchQuery.skills = Array.isArray(skills) ? skills.map(s => String(s)) : String(skills).split(',');
      }
      if (type) {
        searchQuery.type = type as string;
      }

      const jobs = await storage.searchJobs(searchQuery);
      res.json(jobs);
    } catch (error) {
      console.error("Error searching jobs:", error);
      res.status(500).json({ message: "Failed to search jobs" });
    }
  });

  app.get('/api/jobs/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const company = await storage.getCompanyByUserId(userId);

      if (!company) {
        return res.status(404).json({ message: "Company profile not found" });
      }

      const jobs = await storage.getJobsByCompany(company.id);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching company jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get('/api/jobs/pending', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const pendingJobs = await storage.getPendingJobs();
      res.json(pendingJobs);
    } catch (error) {
      console.error("Error fetching pending jobs:", error);
      res.status(500).json({ message: "Failed to fetch pending jobs" });
    }
  });

  app.post('/api/jobs/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const approvedJob = await storage.approveJob(id, userId);

      // Find matching professionals and notify them
      const professionals = await storage.searchProfessionals({
        skills: approvedJob.skills as string[],
        availability: 'available'
      });

      const wsService = getWebSocketService();

      // Use AI to analyze matches and send notifications
      for (const professional of professionals.slice(0, 10)) { // Limit to top 10
        try {
          const matchAnalysis = await analyzeJobProfessionalMatch({
            jobSkills: approvedJob.skills as string[],
            jobRequirements: approvedJob.requirements,
            professionalSkills: professional.skills as string[] || [],
            professionalExperience: professional.experience || 0,
            professionalBio: professional.bio || '',
            professionalPortfolio: professional.portfolio as any
          });

          if (matchAnalysis.matchScore >= 70) {
            wsService.notifyJobMatch(professional.userId, {
              ...approvedJob,
              matchScore: matchAnalysis.matchScore
            });
          }
        } catch (aiError) {
          console.error("AI matching failed for professional:", professional.id, aiError);
        }
      }

      res.json(approvedJob);
    } catch (error) {
      console.error("Error approving job:", error);
      res.status(500).json({ message: "Failed to approve job" });
    }
  });

  // Application routes
  app.post('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);

      if (user?.role !== 'professional') {
        return res.status(403).json({ message: "Only professionals can apply to jobs" });
      }

      const professional = await storage.getProfessionalByUserId(userId);
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        professionalId: professional.id
      });

      // Get job details for AI analysis
      const job = await storage.getJob(applicationData.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      let aiAnalysis = null;
      let matchScore = 0;

      try {
        aiAnalysis = await analyzeJobProfessionalMatch({
          jobSkills: job.skills as string[],
          jobRequirements: job.requirements,
          professionalSkills: professional.skills as string[] || [],
          professionalExperience: professional.experience || 0,
          professionalBio: professional.bio || '',
          professionalPortfolio: professional.portfolio as any
        });
        matchScore = aiAnalysis.matchScore;
      } catch (aiError) {
        console.error("AI analysis failed:", aiError);
      }

      // Create application with AI analysis stored separately
      const application = await storage.createApplication(applicationData);

      // Note: AI analysis storage would be implemented in production
      // if (matchScore > 0 || aiAnalysis) {
      //   await storage.updateApplication(application.id, {
      //     aiAnalysis: aiAnalysis as any
      //   });
      // }

      // Notify company about new application
      const company = await storage.getCompany(job.companyId);
      if (company) {
        const wsService = getWebSocketService();
        wsService.sendNotification(company.userId, {
          type: 'notification',
          data: {
            title: 'New Application Received',
            message: `${professional.title || 'Professional'} applied to ${job.title}`,
            applicationId: application.id,
            matchScore
          }
        });
      }

      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.get('/api/applications/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const professional = await storage.getProfessionalByUserId(userId);

      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      const applications = await storage.getApplicationsByProfessional(professional.id);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get('/api/jobs/:jobId/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { jobId } = req.params;

      // Verify user owns the job
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const company = await storage.getCompanyByUserId(userId);
      if (!company || company.id !== job.companyId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const applications = await storage.getApplicationsByJob(jobId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.put('/api/applications/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const { status } = req.body;

      const application = await storage.getApplication(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Verify user owns the job
      const job = await storage.getJob(application.jobId);
      const company = await storage.getCompanyByUserId(userId);

      if (!company || !job || company.id !== job.companyId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedApplication = await storage.updateApplication(id, { status });

      // Notify professional about status change
      const professional = await storage.getProfessional(application.professionalId);
      if (professional) {
        const wsService = getWebSocketService();
        wsService.notifyApplicationUpdate(professional.userId, {
          id: updatedApplication.id,
          status: updatedApplication.status,
          jobTitle: job.title
        });
      }

      res.json(updatedApplication);
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // AI Recommendations
  app.get('/api/professionals/my/job-recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const professional = await storage.getProfessionalByUserId(userId);

      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      const availableJobs = await storage.searchJobs({ status: 'active' });

      const recommendations = await generateJobRecommendations(
        professional.skills as string[] || [],
        availableJobs.map(job => ({
          id: job.id,
          title: job.title,
          skills: job.skills as string[],
          description: job.description
        }))
      );

      res.json(recommendations);
    } catch (error) {
      console.error("Error generating job recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  app.post('/api/professionals/my/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const professional = await storage.getProfessionalByUserId(userId);

      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      const analysis = await analyzeProfessionalProfile(
        professional.skills as string[] || [],
        professional.bio || '',
        professional.experience || 0,
        professional.portfolio as any
      );

      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing professional profile:", error);
      res.status(500).json({ message: "Failed to analyze profile" });
    }
  });

  // Contract routes
  app.post('/api/contracts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const contractData = insertContractSchema.parse({
        ...req.body,
        managedBy: userId,
        status: 'draft'
      });

      const contract = await storage.createContract(contractData);

      // Notify both parties
      const professional = await storage.getProfessional(contract.professionalId);
      const company = await storage.getCompany(contract.companyId);
      const wsService = getWebSocketService();

      if (professional) {
        wsService.notifyContractUpdate(professional.userId, contract);
      }
      if (company) {
        wsService.notifyContractUpdate(company.userId, contract);
      }

      res.status(201).json(contract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contract data", errors: error.errors });
      }
      console.error("Error creating contract:", error);
      res.status(500).json({ message: "Failed to create contract" });
    }
  });

  app.get('/api/contracts/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      let contracts: any[] = [];

      if (user?.role === 'company') {
        const company = await storage.getCompanyByUserId(userId);
        if (company) {
          contracts = await storage.getContractsByCompany(company.id);
        }
      } else if (user?.role === 'professional') {
        const professional = await storage.getProfessionalByUserId(userId);
        if (professional) {
          contracts = await storage.getContractsByProfessional(professional.id);
        }
      }

      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markNotificationRead(id);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.get('/api/notifications/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const count = await storage.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  // Admin dashboard stats
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get WebSocket stats
      const wsService = getWebSocketService();

      res.json({
        connectedClients: wsService.getConnectedClientsCount(),
        connectedCompanies: wsService.getClientsByRole('company'),
        connectedProfessionals: wsService.getClientsByRole('professional'),
        connectedAdmins: wsService.getClientsByRole('admin'),
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  return httpServer;
}