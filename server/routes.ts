// Server routes using blueprint:javascript_auth_all_persistance
import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { db } from "./db";
import { 
  jobs, 
  companies, 
  professionals, 
  applications, 
  contracts, 
  notifications,
  type InsertJob,
  type InsertCompany,
  type InsertProfessional,
  type InsertApplication,
  type InsertContract,
  type InsertNotification
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes: /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

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

  const httpServer = createServer(app);
  return httpServer;
}