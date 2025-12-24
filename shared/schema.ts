import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Interviews & proposals share timezone list

const personalEmailDomains = new Set([
  "gmail.com",
  "yahoo.com",
  "yahoo.in",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "yandex.com",
  "gmx.com",
  "live.com",
  "rediffmail.com",
]);

// --------------------------------------------------
// User (Intern) Schema
// --------------------------------------------------
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  countryCode: text("country_code").notNull().default("+91"),
  phoneNumber: text("phone_number").notNull(),
  password: text("password").notNull(),
  agreedToTerms: boolean("agreed_to_terms").notNull().default(false),
  // intern | employee
  role: text("role").notNull().default("intern"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  role: true, // role backend se default "intern" set karega
}).extend({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .refine(
      (email) => {
        const domain = email.split("@").pop();
        return !!domain && personalEmailDomains.has(domain);
      },
      {
        message: "Please use a personal email address (Gmail, Yahoo, Outlook, etc.)",
      },
    ),
  countryCode: z.literal("+91", {
    errorMap: () => ({ message: "Only +91 phone numbers are supported" }),
  }),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number too long"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agreedToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms & Conditions",
  }),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// --------------------------------------------------
// Employer / Company Schema
// --------------------------------------------------
export const employers = pgTable("employers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  companyName: text("company_name").notNull(),
  companyEmail: text("company_email").notNull().unique(),
  countryCode: text("country_code").notNull().default("+91"),
  phoneNumber: text("phone_number").notNull(),
  password: text("password").notNull(),
  agreedToTerms: boolean("agreed_to_terms").notNull().default(false),
  websiteUrl: text("website_url"),
  companySize: text("company_size"),
  city: text("city"),
  state: text("state"),
  primaryContactName: text("primary_contact_name"),
  primaryContactRole: text("primary_contact_role"),
  escalationContactName: text("escalation_contact_name"),
  escalationContactEmail: text("escalation_contact_email"),
  escalationContactPhone: text("escalation_contact_phone"),
  escalationContactRole: text("escalation_contact_role"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  accountHolderName: text("account_holder_name"),
  ifscCode: text("ifsc_code"),
  swiftCode: text("swift_code"),
  gstNumber: text("gst_number"),
  setupCompleted: boolean("setup_completed").notNull().default(false),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmployerSchema = createInsertSchema(employers).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .refine(
      (email) => {
        const domain = email.split("@").pop();
        return !!domain && !personalEmailDomains.has(domain);
      },
      {
        message: "Please use a company/work email address (not Gmail, Yahoo, Outlook, etc.)",
      },
    ),
  countryCode: z.string().min(1, "Country code is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number too long"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agreedToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms & Conditions",
  }),
});

export type InsertEmployer = z.infer<typeof insertEmployerSchema>;
export type Employer = typeof employers.$inferSelect;

// --------------------------------------------------
// Admin Schema (for /admin/login)
// --------------------------------------------------
export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  role: text("role").default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;

// --------------------------------------------------
// Google OAuth Tokens (Employer Calendar / Meet)
// --------------------------------------------------
export const employerGoogleTokens = pgTable("employer_google_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employerId: varchar("employer_id").notNull().unique(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  scope: text("scope"),
  tokenType: text("token_type"),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type EmployerGoogleToken = typeof employerGoogleTokens.$inferSelect;
export type InsertEmployerGoogleToken = typeof employerGoogleTokens.$inferInsert;

// --------------------------------------------------
// Projects Schema
// --------------------------------------------------
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employerId: varchar("employer_id").notNull(),
  projectName: text("project_name").notNull(),
  skills: jsonb("skills").$type<string[]>().default([]),
  scopeOfWork: text("scope_of_work"),
  fullTimeOffer: boolean("full_time_offer").default(false),
  locationType: text("location_type"), // onsite, hybrid, remote
  pincode: text("pincode"),
  city: text("city"),
  timezone: text("timezone"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
}).extend({
  projectName: z.string().min(2, "Project name must be at least 2 characters"),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export const countryCodes = [
  { code: "+91", country: "IN", flag: "IN" },
  { code: "+1", country: "US", flag: "US" },
  { code: "+44", country: "UK", flag: "GB" },
  { code: "+61", country: "AU", flag: "AU" },
  { code: "+49", country: "DE", flag: "DE" },
  { code: "+33", country: "FR", flag: "FR" },
  { code: "+81", country: "JP", flag: "JP" },
  { code: "+86", country: "CN", flag: "CN" },
  { code: "+65", country: "SG", flag: "SG" },
  { code: "+971", country: "AE", flag: "AE" },
] as const;

export const companySizes = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
] as const;

export const scopeOfWorkOptions = [
  { value: "short-term", label: "Short-Term: 30–60 days" },
  { value: "medium-term", label: "Medium-Term: 60–90 days" },
  { value: "long-term", label: "Long-Term: 90+ days" },
  { value: "not-sure", label: "Not Sure" },
] as const;

export const timezones = [
  // UTC / Global
  { value: "UTC", label: "UTC" },
  { value: "Etc/UTC", label: "Etc/UTC" },
  { value: "Etc/GMT", label: "Etc/GMT" },

  // Asia (India + nearby)
  { value: "Asia/Kolkata", label: "Asia/Kolkata (Recommended for India)" },
  { value: "Asia/Karachi", label: "Asia/Karachi" },
  { value: "Asia/Dhaka", label: "Asia/Dhaka" },
  { value: "Asia/Kathmandu", label: "Asia/Kathmandu" },
  { value: "Asia/Colombo", label: "Asia/Colombo" },
  { value: "Asia/Dubai", label: "Asia/Dubai" },
  { value: "Asia/Muscat", label: "Asia/Muscat" },
  { value: "Asia/Riyadh", label: "Asia/Riyadh" },
  { value: "Asia/Qatar", label: "Asia/Qatar" },
  { value: "Asia/Kuwait", label: "Asia/Kuwait" },
  { value: "Asia/Tehran", label: "Asia/Tehran" },
  { value: "Asia/Baghdad", label: "Asia/Baghdad" },
  { value: "Asia/Jerusalem", label: "Asia/Jerusalem" },
  { value: "Asia/Amman", label: "Asia/Amman" },
  { value: "Asia/Beirut", label: "Asia/Beirut" },
  { value: "Asia/Damascus", label: "Asia/Damascus" },
  { value: "Asia/Istanbul", label: "Asia/Istanbul" },
  { value: "Asia/Tbilisi", label: "Asia/Tbilisi" },
  { value: "Asia/Yerevan", label: "Asia/Yerevan" },
  { value: "Asia/Baku", label: "Asia/Baku" },
  { value: "Asia/Kabul", label: "Asia/Kabul" },
  { value: "Asia/Tashkent", label: "Asia/Tashkent" },
  { value: "Asia/Almaty", label: "Asia/Almaty" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo" },
  { value: "Asia/Seoul", label: "Asia/Seoul" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai" },
  { value: "Asia/Hong_Kong", label: "Asia/Hong_Kong" },
  { value: "Asia/Taipei", label: "Asia/Taipei" },
  { value: "Asia/Singapore", label: "Asia/Singapore" },
  { value: "Asia/Kuala_Lumpur", label: "Asia/Kuala_Lumpur" },
  { value: "Asia/Jakarta", label: "Asia/Jakarta" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok" },
  { value: "Asia/Ho_Chi_Minh", label: "Asia/Ho_Chi_Minh" },
  { value: "Asia/Manila", label: "Asia/Manila" },

  // Europe
  { value: "Europe/London", label: "Europe/London" },
  { value: "Europe/Paris", label: "Europe/Paris" },
  { value: "Europe/Berlin", label: "Europe/Berlin" },
  { value: "Europe/Rome", label: "Europe/Rome" },
  { value: "Europe/Madrid", label: "Europe/Madrid" },
  { value: "Europe/Amsterdam", label: "Europe/Amsterdam" },
  { value: "Europe/Brussels", label: "Europe/Brussels" },
  { value: "Europe/Vienna", label: "Europe/Vienna" },
  { value: "Europe/Zurich", label: "Europe/Zurich" },
  { value: "Europe/Stockholm", label: "Europe/Stockholm" },
  { value: "Europe/Oslo", label: "Europe/Oslo" },
  { value: "Europe/Copenhagen", label: "Europe/Copenhagen" },
  { value: "Europe/Helsinki", label: "Europe/Helsinki" },
  { value: "Europe/Warsaw", label: "Europe/Warsaw" },
  { value: "Europe/Prague", label: "Europe/Prague" },
  { value: "Europe/Budapest", label: "Europe/Budapest" },
  { value: "Europe/Athens", label: "Europe/Athens" },
  { value: "Europe/Bucharest", label: "Europe/Bucharest" },
  { value: "Europe/Sofia", label: "Europe/Sofia" },
  { value: "Europe/Kiev", label: "Europe/Kiev" },
  { value: "Europe/Moscow", label: "Europe/Moscow" },
  { value: "Europe/Lisbon", label: "Europe/Lisbon" },
  { value: "Europe/Dublin", label: "Europe/Dublin" },
  { value: "Europe/Reykjavik", label: "Europe/Reykjavik" },

  // America
  { value: "America/New_York", label: "America/New_York" },
  { value: "America/Chicago", label: "America/Chicago" },
  { value: "America/Denver", label: "America/Denver" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles" },
  { value: "America/Phoenix", label: "America/Phoenix" },
  { value: "America/Anchorage", label: "America/Anchorage" },
  { value: "America/Toronto", label: "America/Toronto" },
  { value: "America/Vancouver", label: "America/Vancouver" },
  { value: "America/Mexico_City", label: "America/Mexico_City" },
  { value: "America/Bogota", label: "America/Bogota" },
  { value: "America/Lima", label: "America/Lima" },
  { value: "America/Santiago", label: "America/Santiago" },
  { value: "America/Argentina/Buenos_Aires", label: "America/Argentina/Buenos_Aires" },
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo" },
  { value: "America/Havana", label: "America/Havana" },
  { value: "America/Panama", label: "America/Panama" },
  { value: "America/Jamaica", label: "America/Jamaica" },

  // Australia & Pacific
  { value: "Australia/Sydney", label: "Australia/Sydney" },
  { value: "Australia/Melbourne", label: "Australia/Melbourne" },
  { value: "Australia/Brisbane", label: "Australia/Brisbane" },
  { value: "Australia/Perth", label: "Australia/Perth" },
  { value: "Australia/Adelaide", label: "Australia/Adelaide" },
  { value: "Australia/Darwin", label: "Australia/Darwin" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland" },
  { value: "Pacific/Fiji", label: "Pacific/Fiji" },
  { value: "Pacific/Guam", label: "Pacific/Guam" },
  { value: "Pacific/Honolulu", label: "Pacific/Honolulu" },

  // Africa
  { value: "Africa/Cairo", label: "Africa/Cairo" },
  { value: "Africa/Johannesburg", label: "Africa/Johannesburg" },
  { value: "Africa/Nairobi", label: "Africa/Nairobi" },
  { value: "Africa/Lagos", label: "Africa/Lagos" },
  { value: "Africa/Accra", label: "Africa/Accra" },
  { value: "Africa/Casablanca", label: "Africa/Casablanca" },
  { value: "Africa/Algiers", label: "Africa/Algiers" },
  { value: "Africa/Tunis", label: "Africa/Tunis" },
] as const;
// Interviews Schema
// --------------------------------------------------

export const interviews = pgTable("interviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employerId: varchar("employer_id").notNull(),
  internId: varchar("intern_id").notNull(),
  projectId: varchar("project_id"),
  status: text("status").notNull().default("pending"),
  slot1: timestamp("slot1"),
  slot2: timestamp("slot2"),
  slot3: timestamp("slot3"),
  selectedSlot: integer("selected_slot"),
  timezone: text("timezone"),
  meetingLink: text("meeting_link"),
  calendarEventId: text("calendar_event_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = typeof interviews.$inferInsert;

// --------------------------------------------------
// Intern Onboarding Schema
// --------------------------------------------------
export const internOnboarding = pgTable("intern_onboarding", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  linkedinUrl: text("linkedin_url"),
  pinCode: text("pin_code"),
  state: text("state"),
  city: text("city"),
  aadhaarNumber: text("aadhaar_number"),
  panNumber: text("pan_number"),
  bio: text("bio"),
  experienceJson: jsonb("experience_json").$type<any[]>().default([]),
  skills: jsonb("skills").$type<any[]>().default([]),
  locationTypes: jsonb("location_types").$type<string[]>().default([]),
  preferredLocations: jsonb("preferred_locations").$type<string[]>().default([]),
  hasLaptop: boolean("has_laptop"),
  previewSummary: text("preview_summary"),
  extraData: jsonb("extra_data").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInternOnboardingSchema = createInsertSchema(internOnboarding).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInternOnboarding = z.infer<typeof insertInternOnboardingSchema>;
export type InternOnboarding = typeof internOnboarding.$inferSelect;

// --------------------------------------------------
// Intern Documents Schema
// --------------------------------------------------
export const internDocuments = pgTable("intern_document", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),

  // Basic metadata for uploaded files. Actual storage (S3/local) can be configured separately.
  profilePhotoName: text("profile_photo_name"),
  profilePhotoType: text("profile_photo_type"),
  profilePhotoSize: integer("profile_photo_size"),

  introVideoName: text("intro_video_name"),
  introVideoType: text("intro_video_type"),
  introVideoSize: integer("intro_video_size"),

  aadhaarImageName: text("aadhaar_image_name"),
  aadhaarImageType: text("aadhaar_image_type"),
  aadhaarImageSize: integer("aadhaar_image_size"),

  panImageName: text("pan_image_name"),
  panImageType: text("pan_image_type"),
  panImageSize: integer("pan_image_size"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInternDocumentsSchema = createInsertSchema(internDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInternDocuments = z.infer<typeof insertInternDocumentsSchema>;
export type InternDocuments = typeof internDocuments.$inferSelect;
// --------------------------------------------------
// Proposals (Employer -> Intern offers)
// --------------------------------------------------
export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employerId: varchar("employer_id").notNull(),
  internId: varchar("intern_id").notNull(),
  projectId: varchar("project_id").notNull(),
  interviewId: varchar("interview_id"),
  flowType: text("flow_type").notNull(), // direct | interview_first
  status: text("status").notNull().default("sent"), // draft | sent | accepted | rejected | interview_scheduled
  offerDetails: jsonb("offer_details").$type<Record<string, any>>().default({}),
  aiRatings: jsonb("ai_ratings").$type<{
    communication?: number;
    coding?: number;
    aptitude?: number;
    overall?: number;
  }>().default({}),
  skills: jsonb("skills").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;