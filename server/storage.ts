import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  type User,
  type InsertUser,
  type Employer,
  type InsertEmployer,
  type Admin,
  type EmployerGoogleToken,
  type InternDocuments,
  type InsertInternDocuments,
  type InternOnboarding,
  type InsertInternOnboarding,
  type Project,
  type InsertProject,
  type Proposal,
  type InsertProposal,
  type Interview,
  type InsertInterview,
  users,
  employers,
  admins,
  internOnboarding,
  internDocuments,
  projects,
  proposals,
  interviews,
  employerGoogleTokens,
} from "@shared/schema";
import { eq, desc, and, isNull } from "drizzle-orm";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export interface IStorage {
  // Users (interns)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;

  // Employers
  getEmployer(id: string): Promise<Employer | undefined>;
  getEmployerByEmail(email: string): Promise<Employer | undefined>;
  createEmployer(employer: InsertEmployer): Promise<Employer>;
  getEmployers(): Promise<Employer[]>;
  updateEmployer(
    id: string,
    data: Partial<InsertEmployer>,
  ): Promise<Employer | undefined>;
  deleteEmployer(id: string): Promise<void>;

  // Employer Projects
  createProject(project: InsertProject): Promise<Project>;
  getProjectsByEmployerId(employerId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  updateProject(id: string, data: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;

  // Admins
  getAdminByEmail(email: string): Promise<Admin | undefined>;

  // Google OAuth Tokens (Employer Calendar / Meet)
  getEmployerGoogleToken(employerId: string): Promise<EmployerGoogleToken | undefined>;
  upsertEmployerGoogleToken(
    employerId: string,
    data: Partial<EmployerGoogleToken>,
  ): Promise<EmployerGoogleToken>;

  // Intern Onboarding
  createInternOnboarding(data: InsertInternOnboarding): Promise<InternOnboarding>;
  getInternOnboardingByUserId(userId: string): Promise<InternOnboarding | undefined>;
  updateInternOnboarding(userId: string, data: Partial<InsertInternOnboarding>): Promise<InternOnboarding | undefined>;

  // Intern Documents
  getInternDocumentsByUserId(userId: string): Promise<InternDocuments | undefined>;
  upsertInternDocumentsByUserId(userId: string, data: Partial<InsertInternDocuments>): Promise<InternDocuments>;

  // Proposals
  createProposal(data: InsertProposal): Promise<Proposal>;
  getProposal(id: string): Promise<Proposal | undefined>;
  getProposalsByEmployerId(employerId: string): Promise<Proposal[]>;
  getProposalsByInternId(internId: string): Promise<Proposal[]>;
  updateProposalStatus(id: string, status: string): Promise<Proposal | undefined>;
  updateProposal(id: string, data: Partial<InsertProposal>): Promise<Proposal | undefined>;

  // Interviews
  createInterview(data: InsertInterview): Promise<Interview>;
  getLatestInterviewForEmployerInternProject(
    employerId: string,
    internId: string,
    projectId?: string | null,
  ): Promise<Interview | undefined>;
  getInterviewsByInternId(internId: string): Promise<Interview[]>;
  getInterviewsByEmployerId(employerId: string): Promise<Interview[]>;
  updateInterviewSelectedSlot(id: string, selectedSlot: number): Promise<Interview | undefined>;
  updateInterviewScheduleWithMeetingLink(
    id: string,
    selectedSlot: number,
    meetingLink: string | null,
    calendarEventId?: string | null,
  ): Promise<Interview | undefined>;
  updateInterviewMeetingLink(
    id: string,
    meetingLink: string,
    notes?: string | null,
  ): Promise<Interview | undefined>;
  resetInterviewToPending(id: string): Promise<Interview | undefined>;
  getInterview(id: string): Promise<Interview | undefined>;
  updateInterviewStatus(id: string, status: string): Promise<Interview | undefined>;
}

export class PostgresStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async updateUser(
    id: string,
    data: Partial<InsertUser>,
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Employers
  async getEmployer(id: string): Promise<Employer | undefined> {
    const [employer] = await db
      .select()
      .from(employers)
      .where(eq(employers.id, id));
    return employer;
  }

  async getEmployerByEmail(email: string): Promise<Employer | undefined> {
    const [employer] = await db
      .select()
      .from(employers)
      .where(eq(employers.companyEmail, email));
    return employer;
  }

  async createEmployer(insertEmployer: InsertEmployer): Promise<Employer> {
    const [employer] = await db
      .insert(employers)
      .values(insertEmployer)
      .returning();
    return employer;
  }

  async getEmployers(): Promise<Employer[]> {
    return db.select().from(employers);
  }

  async updateEmployer(
    id: string,
    data: Partial<InsertEmployer>,
  ): Promise<Employer | undefined> {
    const [employer] = await db
      .update(employers)
      .set(data)
      .where(eq(employers.id, id))
      .returning();
    return employer;
  }

  async deleteEmployer(id: string): Promise<void> {
    await db.delete(employers).where(eq(employers.id, id));
  }

  // Employer Projects
  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async getProjectsByEmployerId(employerId: string): Promise<Project[]> {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.employerId, employerId))
      .orderBy(desc(projects.createdAt));
    return result;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project;
  }

  async updateProject(
    id: string,
    data: Partial<InsertProject>,
  ): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set(data)
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Admins
  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email));
    return admin;
  }

  // Google OAuth Tokens (Employer Calendar / Meet)
  async getEmployerGoogleToken(
    employerId: string,
  ): Promise<EmployerGoogleToken | undefined> {
    const [row] = await db
      .select()
      .from(employerGoogleTokens)
      .where(eq(employerGoogleTokens.employerId, employerId));
    return row;
  }

  async upsertEmployerGoogleToken(
    employerId: string,
    data: Partial<EmployerGoogleToken>,
  ): Promise<EmployerGoogleToken> {
    const existing = await this.getEmployerGoogleToken(employerId);

    if (existing) {
      const [updated] = await db
        .update(employerGoogleTokens)
        .set({
          ...data,
          employerId,
          updatedAt: new Date(),
        } as any)
        .where(eq(employerGoogleTokens.employerId, employerId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(employerGoogleTokens)
      .values({
        ...(data as any),
        employerId,
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  // Intern Onboarding
  async createInternOnboarding(data: InsertInternOnboarding): Promise<InternOnboarding> {
    // Prepare data for insert: pass native JS values for jsonb fields
    const sanitizedData: any = {
      ...data,
      experienceJson: data.experienceJson ?? [],
      skills: data.skills ?? [],
      extraData: data.extraData ?? {},
      locationTypes: Array.isArray(data.locationTypes) ? data.locationTypes : [],
      preferredLocations: Array.isArray(data.preferredLocations) ? data.preferredLocations : [],
      updatedAt: new Date(),
    };

    console.log("Prepared data for DB insert:", sanitizedData);

    const [onboarding] = await db
      .insert(internOnboarding)
      .values(sanitizedData as any)
      .returning();
    return onboarding;
  }

  async getInternOnboardingByUserId(userId: string): Promise<InternOnboarding | undefined> {
    const [onboarding] = await db
      .select()
      .from(internOnboarding)
      .where(eq(internOnboarding.userId, userId))
      .orderBy(desc(internOnboarding.createdAt))
      .limit(1);
    return onboarding;
  }

  async getAllInternOnboarding(): Promise<InternOnboarding[]> {
    const result = await db
      .select()
      .from(internOnboarding)
      .orderBy(desc(internOnboarding.createdAt));
    return result;
  }

  async updateInternOnboarding(
    userId: string,
    data: Partial<InsertInternOnboarding>,
  ): Promise<InternOnboarding | undefined> {
    // Handle different column types:
    // - JSONB columns: must be JSON strings
    // - text[] array columns: must be native arrays or null
    const sanitizedData: any = { ...data };

    // JSONB columns - pass native JS values
    if (data.experienceJson !== undefined) {
      sanitizedData.experienceJson = data.experienceJson ?? [];
    }
    if (data.skills !== undefined) {
      sanitizedData.skills = data.skills ?? [];
    }
    if (data.extraData !== undefined) {
      sanitizedData.extraData = data.extraData ?? {};
    }

    // jsonb array columns - ensure arrays
    if (data.locationTypes !== undefined) {
      sanitizedData.locationTypes = Array.isArray(data.locationTypes) ? data.locationTypes : [];
    }
    if (data.preferredLocations !== undefined) {
      sanitizedData.preferredLocations = Array.isArray(data.preferredLocations) ? data.preferredLocations : [];
    }
    const [updated] = await db
      .update(internOnboarding)
      .set({ ...sanitizedData, updatedAt: new Date() })
      .where(eq(internOnboarding.userId, userId))
      .returning();
    return updated;
  }

  async updateInterviewMeetingLink(
    id: string,
    meetingLink: string,
    notes?: string | null,
  ): Promise<Interview | undefined> {
    const [updated] = await db
      .update(interviews)
      .set({
        meetingLink,
        notes: notes ?? null,
        updatedAt: new Date(),
      } as any)
      .where(eq(interviews.id, id))
      .returning();
    return updated;
  }

  // Interviews
  async createInterview(data: InsertInterview): Promise<Interview> {
    const [interview] = await db
      .insert(interviews)
      .values({
        ...data,
        updatedAt: new Date(),
      } as any)
      .returning();
    return interview;
  }

  async getLatestInterviewForEmployerInternProject(
    employerId: string,
    internId: string,
    projectId?: string | null,
  ): Promise<Interview | undefined> {
    const conditions = [eq(interviews.employerId, employerId), eq(interviews.internId, internId)];
    if (projectId !== undefined) {
      if (projectId === null) {
        conditions.push(isNull(interviews.projectId));
      } else {
        conditions.push(eq(interviews.projectId, projectId));
      }
    }

    const [interview] = await db
      .select()
      .from(interviews)
      .where(and(...conditions))
      .orderBy(desc(interviews.createdAt))
      .limit(1);
    return interview;
  }

  async getInterviewsByInternId(internId: string): Promise<Interview[]> {
    const result = await db
      .select()
      .from(interviews)
      .where(eq(interviews.internId, internId))
      .orderBy(desc(interviews.createdAt));
    return result;
  }

  async getInterviewsByEmployerId(employerId: string): Promise<Interview[]> {
    const result = await db
      .select()
      .from(interviews)
      .where(eq(interviews.employerId, employerId))
      .orderBy(desc(interviews.createdAt));
    return result;
  }

  async getInterview(id: string): Promise<Interview | undefined> {
    const [interview] = await db
      .select()
      .from(interviews)
      .where(eq(interviews.id, id));
    return interview;
  }

  async updateInterviewSelectedSlot(
    id: string,
    selectedSlot: number,
  ): Promise<Interview | undefined> {
    const [updated] = await db
      .update(interviews)
      .set({
        selectedSlot,
        status: "scheduled",
        updatedAt: new Date(),
      } as any)
      .where(eq(interviews.id, id))
      .returning();
    return updated;
  }

  async updateInterviewScheduleWithMeetingLink(
    id: string,
    selectedSlot: number,
    meetingLink: string | null,
    calendarEventId?: string | null,
  ): Promise<Interview | undefined> {
    const [updated] = await db
      .update(interviews)
      .set({
        selectedSlot,
        status: "scheduled",
        meetingLink,
        calendarEventId: calendarEventId ?? null,
        updatedAt: new Date(),
      } as any)
      .where(eq(interviews.id, id))
      .returning();
    return updated;
  }

  async resetInterviewToPending(id: string): Promise<Interview | undefined> {
    const [updated] = await db
      .update(interviews)
      .set({
        status: "pending",
        selectedSlot: null,
        updatedAt: new Date(),
      } as any)
      .where(eq(interviews.id, id))
      .returning();
    return updated;
  }

  async updateInterviewStatus(
    id: string,
    status: string,
  ): Promise<Interview | undefined> {
    const [updated] = await db
      .update(interviews)
      .set({ status, updatedAt: new Date() } as any)
      .where(eq(interviews.id, id))
      .returning();
    return updated;
  }

  // Intern Documents
  async getInternDocumentsByUserId(userId: string): Promise<InternDocuments | undefined> {
    const [doc] = await db
      .select()
      .from(internDocuments)
      .where(eq(internDocuments.userId, userId))
      .orderBy(desc(internDocuments.createdAt))
      .limit(1);
    return doc;
  }

  async upsertInternDocumentsByUserId(
    userId: string,
    data: Partial<InsertInternDocuments>,
  ): Promise<InternDocuments> {
    const existing = await this.getInternDocumentsByUserId(userId);

    if (existing) {
      const [updated] = await db
        .update(internDocuments)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(internDocuments.userId, userId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(internDocuments)
      .values({ ...(data as InsertInternDocuments), userId, updatedAt: new Date() })
      .returning();
    return created;
  }

  // Proposals
  async createProposal(data: InsertProposal): Promise<Proposal> {
    const [proposal] = await db
      .insert(proposals)
      .values({
        ...data,
        interviewId: data.interviewId, // Pass through optional interviewId
        // ensure jsonb defaults are always proper objects/arrays
        offerDetails: data.offerDetails ?? {},
        aiRatings: data.aiRatings ?? {},
        skills: Array.isArray(data.skills) ? data.skills : [],
        updatedAt: new Date(),
      } as any)
      .returning();
    return proposal;
  }

  async getProposal(id: string): Promise<Proposal | undefined> {
    const [proposal] = await db
      .select()
      .from(proposals)
      .where(eq(proposals.id, id));
    return proposal;
  }

  async getProposalsByEmployerId(employerId: string): Promise<Proposal[]> {
    const result = await db
      .select()
      .from(proposals)
      .where(eq(proposals.employerId, employerId))
      .orderBy(desc(proposals.createdAt));
    return result;
  }

  async getProposalsByInternId(internId: string): Promise<Proposal[]> {
    const result = await db
      .select()
      .from(proposals)
      .where(eq(proposals.internId, internId))
      .orderBy(desc(proposals.createdAt));
    return result;
  }

  async updateProposalStatus(
    id: string,
    status: string,
  ): Promise<Proposal | undefined> {
    const [updated] = await db
      .update(proposals)
      .set({ status, updatedAt: new Date() } as any)
      .where(eq(proposals.id, id))
      .returning();
    return updated;
  }

  async updateProposal(
    id: string,
    data: Partial<InsertProposal>,
  ): Promise<Proposal | undefined> {
    const sanitized: any = { ...data };

    if (data.offerDetails !== undefined) {
      sanitized.offerDetails = data.offerDetails ?? {};
    }
    if (data.aiRatings !== undefined) {
      sanitized.aiRatings = data.aiRatings ?? {};
    }
    if (data.skills !== undefined) {
      sanitized.skills = Array.isArray(data.skills) ? data.skills : [];
    }

    const [updated] = await db
      .update(proposals)
      .set({ ...sanitized, updatedAt: new Date() } as any)
      .where(eq(proposals.id, id))
      .returning();
    return updated;
  }
}

export const storage = new PostgresStorage();
