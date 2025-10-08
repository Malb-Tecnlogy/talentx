import {
  users,
  companies,
  professionals,
  jobs,
  applications,
  contracts,
  notifications,
  oauthAccounts,
  type User,
  type SafeUser,
  safeUserSchema,
  type UpsertUser,
  type InsertUser,
  type InsertCompany,
  type Company,
  type InsertProfessional,
  type Professional,
  type InsertJob,
  type Job,
  type InsertApplication,
  type Application,
  type InsertContract,
  type Contract,
  type InsertNotification,
  type Notification,
  type InsertOAuthAccount,
  type OAuthAccount,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, or, ilike } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";

const PostgresSessionStore = connectPg(session);
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getSafeUser(id: string): Promise<SafeUser | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<SafeUser>;
  
  // Company operations
  createCompany(company: InsertCompany): Promise<Company>;
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyByUserId(userId: string): Promise<Company | undefined>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company>;
  
  // Professional operations
  createProfessional(professional: InsertProfessional): Promise<Professional>;
  getProfessional(id: string): Promise<Professional | undefined>;
  getProfessionalByUserId(userId: string): Promise<Professional | undefined>;
  updateProfessional(id: string, professional: Partial<InsertProfessional>): Promise<Professional>;
  searchProfessionals(query: { skills?: string[]; availability?: string }): Promise<Professional[]>;
  
  // Job operations
  createJob(job: InsertJob): Promise<Job>;
  getJob(id: string): Promise<Job | undefined>;
  getJobsByCompany(companyId: string): Promise<Job[]>;
  getPendingJobs(): Promise<Job[]>;
  approveJob(id: string, approvedBy: string): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job>;
  searchJobs(query: { skills?: string[]; type?: string; status?: string }): Promise<Job[]>;
  
  // Application operations
  createApplication(application: InsertApplication): Promise<Application>;
  getApplication(id: string): Promise<Application | undefined>;
  getApplicationsByJob(jobId: string): Promise<Application[]>;
  getApplicationsByProfessional(professionalId: string): Promise<Application[]>;
  updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application>;
  
  // Contract operations
  createContract(contract: InsertContract): Promise<Contract>;
  getContract(id: string): Promise<Contract | undefined>;
  getContractsByCompany(companyId: string): Promise<Contract[]>;
  getContractsByProfessional(professionalId: string): Promise<Contract[]>;
  updateContract(id: string, contract: Partial<InsertContract>): Promise<Contract>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<Notification>;
  getUnreadNotificationsCount(userId: string): Promise<number>;
  
  // OAuth operations
  createOAuthAccount(account: InsertOAuthAccount): Promise<OAuthAccount>;
  getOAuthAccount(provider: string, providerUserId: string): Promise<OAuthAccount | undefined>;
  getOAuthAccountsByUserId(userId: string): Promise<OAuthAccount[]>;
  getUserByEmail(email: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    // Use memory store for now - simpler and more reliable
    // PostgreSQL store can be enabled later if multiple instances are needed
    console.log('[Storage] Using memory session store');
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getSafeUser(id: string): Promise<SafeUser | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return undefined;
    
    // Remove sensitive fields manually to avoid Zod strict validation issues
    const { password, passwordHash, emailVerificationToken, passwordResetToken, ...safeUser } = user;
    return safeUser as SafeUser;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<SafeUser> {
    const normalizedUser = {
      ...user,
      email: user.email?.toLowerCase() // Normalize email to lowercase
    };
    const [newUser] = await db.insert(users).values(normalizedUser).returning();
    
    // Remove sensitive fields manually to avoid Zod strict validation issues
    const { password, passwordHash, emailVerificationToken, passwordResetToken, ...safeUser } = newUser;
    return safeUser as SafeUser;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Company operations
  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getCompanyByUserId(userId: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.userId, userId));
    return company;
  }

  async updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company> {
    const [updated] = await db
      .update(companies)
      .set({ ...company, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return updated;
  }

  // Professional operations
  async createProfessional(professional: InsertProfessional): Promise<Professional> {
    const [newProfessional] = await db.insert(professionals).values({
      ...professional,
      skills: professional.skills ? JSON.stringify(professional.skills) : null,
      portfolio: professional.portfolio ? JSON.stringify(professional.portfolio) : null,
      education: professional.education ? JSON.stringify(professional.education) : null,
      certifications: professional.certifications ? JSON.stringify(professional.certifications) : null,
      workExperience: (professional as any).workExperience ? JSON.stringify((professional as any).workExperience) : null,
    }).returning();
    return newProfessional;
  }

  async getProfessional(id: string): Promise<Professional | undefined> {
    const [professional] = await db.select().from(professionals).where(eq(professionals.id, id));
    return professional;
  }

  async getProfessionalByUserId(userId: string): Promise<Professional | undefined> {
    const [professional] = await db.select().from(professionals).where(eq(professionals.userId, userId));
    return professional;
  }

  async updateProfessional(id: string, professional: Partial<InsertProfessional>): Promise<Professional> {
    const updateData: any = { ...professional, updatedAt: new Date() };
    
    // Handle JSON fields properly - allow clearing arrays by checking field existence
    if ('skills' in professional) {
      updateData.skills = JSON.stringify(professional.skills);
    }
    if ('portfolio' in professional) {
      updateData.portfolio = JSON.stringify(professional.portfolio);
    }
    if ('education' in professional) {
      updateData.education = JSON.stringify(professional.education);
    }
    if ('certifications' in professional) {
      updateData.certifications = JSON.stringify(professional.certifications);
    }
    if ('workExperience' in professional) {
      updateData.workExperience = JSON.stringify((professional as any).workExperience);
    }
    
    const [updated] = await db
      .update(professionals)
      .set(updateData)
      .where(eq(professionals.id, id))
      .returning();
    return updated;
  }

  async searchProfessionals(query: { skills?: string[]; availability?: string }): Promise<Professional[]> {
    let baseQuery = db.select().from(professionals);
    
    const conditions: any[] = [];
    
    if (query.availability) {
      conditions.push(eq(professionals.availability, query.availability));
    }
    
    if (query.skills && query.skills.length > 0) {
      // Use JSON contains for skills search
      conditions.push(sql`${professionals.skills} @> ${JSON.stringify(query.skills)}`);
    }
    
    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions));
    }
    
    return await baseQuery.orderBy(desc(professionals.createdAt));
  }

  // Job operations
  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values({
      ...job,
      skills: job.skills ? JSON.stringify(job.skills) : '[]'
    }).returning();
    return newJob;
  }

  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async getJobsByCompany(companyId: string): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.companyId, companyId))
      .orderBy(desc(jobs.createdAt));
  }

  async getPendingJobs(): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.status, "pending_approval"))
      .orderBy(desc(jobs.createdAt));
  }

  async approveJob(id: string, approvedBy: string): Promise<Job> {
    const [approved] = await db
      .update(jobs)
      .set({
        status: "active",
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, id))
      .returning();
    return approved;
  }

  async updateJob(id: string, job: Partial<InsertJob>): Promise<Job> {
    const updateData: any = { ...job, updatedAt: new Date() };
    
    // Handle JSON fields properly
    if (job.skills) {
      updateData.skills = JSON.stringify(job.skills);
    }
    
    const [updated] = await db
      .update(jobs)
      .set(updateData)
      .where(eq(jobs.id, id))
      .returning();
    return updated;
  }

  async searchJobs(query: { skills?: string[]; type?: string; status?: string }): Promise<Job[]> {
    let baseQuery = db.select().from(jobs);
    
    const conditions: any[] = [];
    
    if (query.type) {
      conditions.push(eq(jobs.type, query.type));
    }
    
    if (query.status) {
      conditions.push(eq(jobs.status, query.status as any));
    } else {
      conditions.push(eq(jobs.status, "active"));
    }
    
    if (query.skills && query.skills.length > 0) {
      conditions.push(sql`${jobs.skills} && ${JSON.stringify(query.skills)}`);
    }
    
    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions));
    }
    
    return await baseQuery.orderBy(desc(jobs.createdAt));
  }

  // Application operations
  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    return newApplication;
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application;
  }

  async getApplicationsByJob(jobId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.jobId, jobId))
      .orderBy(desc(applications.createdAt));
  }

  async getApplicationsByProfessional(professionalId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.professionalId, professionalId))
      .orderBy(desc(applications.createdAt));
  }

  async updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application> {
    const [updated] = await db
      .update(applications)
      .set({ ...application, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return updated;
  }

  // Contract operations
  async createContract(contract: InsertContract): Promise<Contract> {
    const [newContract] = await db.insert(contracts).values(contract).returning();
    return newContract;
  }

  async getContract(id: string): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }

  async getContractsByCompany(companyId: string): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .where(eq(contracts.companyId, companyId))
      .orderBy(desc(contracts.createdAt));
  }

  async getContractsByProfessional(professionalId: string): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .where(eq(contracts.professionalId, professionalId))
      .orderBy(desc(contracts.createdAt));
  }

  async updateContract(id: string, contract: Partial<InsertContract>): Promise<Contract> {
    const [updated] = await db
      .update(contracts)
      .set({ ...contract, updatedAt: new Date() })
      .where(eq(contracts.id, id))
      .returning();
    return updated;
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: string): Promise<Notification> {
    const [updated] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return result.count;
  }

  // OAuth operations
  async createOAuthAccount(account: InsertOAuthAccount): Promise<OAuthAccount> {
    const [newAccount] = await db
      .insert(oauthAccounts)
      .values(account)
      .returning();
    return newAccount;
  }

  async getOAuthAccount(provider: string, providerUserId: string): Promise<OAuthAccount | undefined> {
    const [account] = await db
      .select()
      .from(oauthAccounts)
      .where(and(
        eq(oauthAccounts.provider, provider as any),
        eq(oauthAccounts.providerUserId, providerUserId)
      ));
    return account;
  }

  async getOAuthAccountsByUserId(userId: string): Promise<OAuthAccount[]> {
    return await db
      .select()
      .from(oauthAccounts)
      .where(eq(oauthAccounts.userId, userId))
      .orderBy(desc(oauthAccounts.createdAt));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    return user;
  }
}

export const storage = new DatabaseStorage();
