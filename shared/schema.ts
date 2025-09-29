import { sql } from 'drizzle-orm';
import {
  index,
  uniqueIndex,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const userRoleEnum = pgEnum("user_role", ["company", "professional", "admin"]);
export const oauthProviderEnum = pgEnum("oauth_provider", ["google", "apple"]);
export const jobStatusEnum = pgEnum("job_status", ["draft", "pending_approval", "active", "closed", "paused"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "reviewing", "interview", "selected", "rejected"]);
export const contractStatusEnum = pgEnum("contract_status", ["draft", "active", "completed", "terminated"]);
export const notificationTypeEnum = pgEnum("notification_type", ["job_match", "application_update", "contract_update", "system"]);

// Users table with enhanced authentication support
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email"),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").notNull().default("professional"),
  passwordHash: varchar("password_hash"),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Case-insensitive unique email index
  emailUniqueIndex: uniqueIndex("users_email_unique_idx").on(sql`lower(${table.email})`).where(sql`${table.email} IS NOT NULL`),
  // Username unique index
  usernameUniqueIndex: uniqueIndex("users_username_unique_idx").on(sql`lower(${table.username})`),
}));

// OAuth accounts table for external authentication providers
export const oauthAccounts = pgTable("oauth_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: oauthProviderEnum("provider").notNull(),
  providerUserId: varchar("provider_user_id").notNull(),
  email: varchar("email"),
  // Note: Consider encrypting/hashing these tokens for security
  refreshTokenHash: varchar("refresh_token_hash"), // Store hashed refresh token
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Prevent duplicate provider accounts
  providerAccountUnique: uniqueIndex("oauth_provider_account_unique_idx")
    .on(table.provider, table.providerUserId),
  // Prevent multiple accounts from same provider for one user
  userProviderUnique: uniqueIndex("oauth_user_provider_unique_idx")
    .on(table.userId, table.provider),
  // Performance index for user lookups
  userIdIndex: index("oauth_user_id_idx").on(table.userId),
}));

// Company profiles
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  website: varchar("website"),
  industry: varchar("industry"),
  size: varchar("size"),
  location: varchar("location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Professional profiles
export const professionals = pgTable("professionals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title"),
  bio: text("bio"),
  skills: jsonb("skills").$type<string[]>(),
  experience: integer("experience"), // years
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  availability: varchar("availability").default("available"), // available, busy, unavailable
  location: varchar("location"),
  timezone: varchar("timezone"),
  portfolio: jsonb("portfolio").$type<{ title: string; description: string; url: string; tech: string[] }[]>(),
  education: jsonb("education").$type<{ degree: string; institution: string; year: number }[]>(),
  certifications: jsonb("certifications").$type<{ name: string; issuer: string; year: number }[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job postings
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  skills: jsonb("skills").$type<string[]>().notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  duration: varchar("duration"), // weeks, months
  type: varchar("type").notNull(), // full-time, part-time, contract, project
  status: jobStatusEnum("status").default("draft"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job applications
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  professionalId: varchar("professional_id").notNull().references(() => professionals.id),
  coverLetter: text("cover_letter"),
  proposedRate: decimal("proposed_rate", { precision: 10, scale: 2 }),
  status: applicationStatusEnum("status").default("pending"),
  matchScore: integer("match_score"), // AI-generated match score
  aiAnalysis: jsonb("ai_analysis").$type<{ strengths: string[]; concerns: string[]; recommendation: string }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contracts (MaGenX as employer)
export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  professionalId: varchar("professional_id").notNull().references(() => professionals.id),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  title: varchar("title").notNull(),
  description: text("description"),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("USD"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: contractStatusEnum("status").default("draft"),
  terms: text("terms"),
  managedBy: varchar("managed_by").references(() => users.id), // MaGenX staff member
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // additional data for the notification
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.id],
    references: [companies.userId],
  }),
  professional: one(professionals, {
    fields: [users.id],
    references: [professionals.userId],
  }),
  notifications: many(notifications),
  oauthAccounts: many(oauthAccounts),
}));

export const oauthAccountsRelations = relations(oauthAccounts, ({ one }) => ({
  user: one(users, {
    fields: [oauthAccounts.userId],
    references: [users.id],
  }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
  jobs: many(jobs),
  contracts: many(contracts),
}));

export const professionalsRelations = relations(professionals, ({ one, many }) => ({
  user: one(users, {
    fields: [professionals.userId],
    references: [users.id],
  }),
  applications: many(applications),
  contracts: many(contracts),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  approver: one(users, {
    fields: [jobs.approvedBy],
    references: [users.id],
  }),
  applications: many(applications),
  contracts: many(contracts),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  professional: one(professionals, {
    fields: [applications.professionalId],
    references: [professionals.id],
  }),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  job: one(jobs, {
    fields: [contracts.jobId],
    references: [jobs.id],
  }),
  professional: one(professionals, {
    fields: [contracts.professionalId],
    references: [professionals.id],
  }),
  company: one(companies, {
    fields: [contracts.companyId],
    references: [companies.id],
  }),
  manager: one(users, {
    fields: [contracts.managedBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Insert schemas  
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProfessionalSchema = createInsertSchema(professionals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedAt: true,
  approvedBy: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  matchScore: true,
  aiAnalysis: true,
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertOAuthAccountSchema = createInsertSchema(oauthAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Safe user schema (without sensitive fields)
export const safeUserSchema = createSelectSchema(users).omit({
  password: true,
  passwordHash: true,
  emailVerificationToken: true,
  passwordResetToken: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type SafeUser = z.infer<typeof safeUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertProfessional = z.infer<typeof insertProfessionalSchema>;
export type Professional = typeof professionals.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertOAuthAccount = z.infer<typeof insertOAuthAccountSchema>;
export type OAuthAccount = typeof oauthAccounts.$inferSelect;

// Contact form schema (no database table needed, just validation)
export const contactFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  company: z.string().max(100, "Nome da empresa muito longo").optional(),
  message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres").max(1000, "Mensagem muito longa"),
});

export type ContactForm = z.infer<typeof contactFormSchema>;
