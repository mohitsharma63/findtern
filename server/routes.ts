import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertEmployerSchema,
  insertInternDocumentsSchema,
} from "@shared/schema";
import { z } from "zod";
import { google } from "googleapis";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

function formatGoogleApiError(error: unknown) {
  const e: any = error as any;
  const status = e?.code ?? e?.response?.status ?? null;
  const message =
    e?.errors?.[0]?.message ??
    e?.response?.data?.error_description ??
    e?.response?.data?.error?.message ??
    e?.message ??
    String(error);
  const reason = e?.errors?.[0]?.reason ?? e?.response?.data?.error ?? null;

  return {
    status: typeof status === "number" ? status : null,
    reason: typeof reason === "string" ? reason : null,
    message: typeof message === "string" ? message : String(message),
  };
}

function getGoogleConnectUrl(employerId: string) {
  const id = String(employerId ?? "").trim();
  if (!id) return null;
  return `/api/google/oauth/start?employerId=${encodeURIComponent(id)}`;
}

async function isGoogleConnectedForEmployer(employerId: string) {
  const tokenRow = await storage.getEmployerGoogleToken(employerId);
  return Boolean(tokenRow?.refreshToken || tokenRow?.accessToken);
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const createMeetSchema = z.object({
  summary: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  timezone: z.string().min(1),
});

function getGoogleOAuthClientConfig() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Google OAuth env vars are not configured (GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URI)",
    );
  }

  return { clientId, clientSecret, redirectUri };
}

function getOAuth2Client() {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthClientConfig();
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

type OAuthStatePayload = {
  employerId: string;
  nonce: string;
};

function signOAuthState(payload: OAuthStatePayload) {
  const secret = process.env.GOOGLE_OAUTH_STATE_SECRET;
  if (!secret) {
    throw new Error("GOOGLE_OAUTH_STATE_SECRET is not configured");
  }

  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

function verifyOAuthState(state: string): OAuthStatePayload {
  const secret = process.env.GOOGLE_OAUTH_STATE_SECRET;
  if (!secret) {
    throw new Error("GOOGLE_OAUTH_STATE_SECRET is not configured");
  }

  const [body, sig] = state.split(".");
  if (!body || !sig) {
    throw new Error("Invalid OAuth state");
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    throw new Error("Invalid OAuth state signature");
  }

  const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (!parsed?.employerId || !parsed?.nonce) {
    throw new Error("Invalid OAuth state payload");
  }
  return parsed;
}

async function getEmployerCalendarClient(employerId: string) {
  const tokenRow = await storage.getEmployerGoogleToken(employerId);
  if (!tokenRow?.refreshToken && !tokenRow?.accessToken) {
    throw new Error("Google Calendar is not connected for this employer");
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: tokenRow.accessToken ?? undefined,
    refresh_token: tokenRow.refreshToken ?? undefined,
    scope: tokenRow.scope ?? undefined,
    token_type: tokenRow.tokenType ?? undefined,
    expiry_date: tokenRow.expiryDate ? tokenRow.expiryDate.getTime() : undefined,
  });

  oauth2Client.on("tokens", async (tokens) => {
    try {
      await storage.upsertEmployerGoogleToken(employerId, {
        accessToken: tokens.access_token ?? tokenRow.accessToken ?? null,
        refreshToken: tokens.refresh_token ?? tokenRow.refreshToken ?? null,
        scope: tokens.scope ?? tokenRow.scope ?? null,
        tokenType: tokens.token_type ?? tokenRow.tokenType ?? null,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : tokenRow.expiryDate ?? null,
      } as any);
    } catch (e) {
      console.error("Failed to persist refreshed Google tokens:", e);
    }
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  return calendar;
}

async function createGoogleMeetLinkForEmployer(opts: {
  employerId: string;
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  attendees?: { email: string }[];
}) {
  const calendar = await getEmployerCalendarClient(opts.employerId);
  const calendarId = process.env.MEET_CALENDAR_ID || "primary";

  const requestId = uuidv4();

  const eventResponse = await calendar.events.insert({
    calendarId,
    conferenceDataVersion: 1,
    requestBody: {
      summary: opts.summary,
      description: opts.description ?? "",
      start: {
        dateTime: opts.startTime.toISOString(),
        timeZone: opts.timezone,
      },
      end: {
        dateTime: opts.endTime.toISOString(),
        timeZone: opts.timezone,
      },
      attendees: opts.attendees && opts.attendees.length ? opts.attendees : undefined,
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  const event = eventResponse.data;

  const hangoutLink =
    event.hangoutLink ||
    event.conferenceData?.entryPoints?.find(
      (e) => e.entryPointType === "video",
    )?.uri;

  if (!hangoutLink) {
    throw new Error("Failed to create Google Meet link");
  }

  return {
    meetingLink: hangoutLink,
    eventId: event.id,
  };
}

function serializeInterview(i: any) {
  if (!i) return i;
  return {
    ...i,
    project_id: i.projectId ?? null,
    meet_link: i.meetingLink ?? null,
    calendar_event_id: i.calendarEventId ?? null,
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // ---------------------------------------------
  // Public Auth Endpoints
  // ---------------------------------------------

  app.get("/api/employer/:employerId/google/status", async (req, res) => {
    try {
      const employerId = req.params.employerId;
      const tokenRow = await storage.getEmployerGoogleToken(employerId);

      return res.json({
        employerId,
        connected: Boolean(tokenRow?.refreshToken || tokenRow?.accessToken),
        hasRefreshToken: Boolean(tokenRow?.refreshToken),
        hasAccessToken: Boolean(tokenRow?.accessToken),
        scope: tokenRow?.scope ?? null,
        expiryDate: tokenRow?.expiryDate ? tokenRow.expiryDate.toISOString() : null,
      });
    } catch (error) {
      console.error("Employer Google status error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while fetching Google connection status" });
    }
  });

  app.get("/api/google/oauth/start", async (req, res) => {
    try {
      const employerId = String(req.query.employerId ?? "").trim();
      if (!employerId) {
        return res.status(400).json({ message: "employerId is required" });
      }

      const nonce = crypto.randomBytes(16).toString("hex");
      const state = signOAuthState({ employerId, nonce });

      const oauth2Client = getOAuth2Client();
      const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        include_granted_scopes: true,
        scope: [
          "https://www.googleapis.com/auth/calendar.events",
          "https://www.googleapis.com/auth/calendar",
        ],
        state,
      });

      return res.redirect(url);
    } catch (error) {
      console.error("Google OAuth start error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while starting Google OAuth" });
    }
  });

  const googleOAuthCallbackHandler = async (req: any, res: any) => {
    try {
      const code = String(req.query.code ?? "");
      const state = String(req.query.state ?? "");
      if (!code || !state) {
        return res.status(400).json({ message: "Missing code or state" });
      }

      const payload = verifyOAuthState(state);
      const oauth2Client = getOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code);

      const existing = await storage
        .getEmployerGoogleToken(payload.employerId)
        .catch(() => undefined);

      await storage.upsertEmployerGoogleToken(payload.employerId, {
        accessToken: tokens.access_token ?? null,
        refreshToken: tokens.refresh_token ?? existing?.refreshToken ?? null,
        scope: tokens.scope ?? null,
        tokenType: tokens.token_type ?? null,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      } as any);

      const redirect = process.env.GOOGLE_OAUTH_SUCCESS_REDIRECT;
      if (redirect) {
        return res.redirect(redirect);
      }

      return res.status(200).json({
        message: "Google Calendar connected successfully",
        employerId: payload.employerId,
      });
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while completing Google OAuth" });
    }
  };

  app.get("/api/google/oauth/callback", googleOAuthCallbackHandler);
  app.get("/auth/google/callback", googleOAuthCallbackHandler);

  app.post("/api/calendar/meet", async (req, res) => {
    try {
      const body = createMeetSchema.parse(req.body);

      const employerId = String((req.query as any)?.employerId ?? "").trim();
      if (!employerId) {
        return res.status(400).json({ message: "employerId is required" });
      }

      const start = new Date(body.startTime);
      const end = new Date(body.endTime);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return res
          .status(400)
          .json({ message: "Invalid startTime or endTime" });
      }

      if (end.getTime() <= start.getTime()) {
        return res
          .status(400)
          .json({ message: "endTime must be after startTime" });
      }

      const result = await createGoogleMeetLinkForEmployer({
        employerId,
        summary: body.summary,
        description: body.description,
        startTime: start,
        endTime: end,
        timezone: body.timezone,
      });

      return res.status(201).json({
        meetingLink: result.meetingLink,
        eventId: result.eventId,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }

      console.error("Create Google Meet link error:", error);
      return res.status(500).json({
        message: "An error occurred while creating Google Meet link",
      });
    }
  });

  // User registration endpoint - /signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "An account with this email already exists" });
      }

      const user = await storage.createUser(validatedData);
      console.log("User created:", user);
      const { password, ...userWithoutPassword } = user;

      return res.status(201).json({
        message: "Account created successfully",
        user: userWithoutPassword,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }
      console.error("Signup error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred during registration" });
    }
  });

  // List all interns with user + onboarding + documents (for employer dashboard)
  app.get("/api/interns", async (_req, res) => {
    try {
      const onboardingList = await storage.getAllInternOnboarding();
      const userIds = Array.from(new Set(onboardingList.map((i) => i.userId)));

      const usersById: Record<string, any> = {};
      const docsByUserId: Record<string, any | null> = {};

      for (const id of userIds) {
        const user = await storage.getUser(id);
        if (user) {
          const { password, ...safeUser } = user as any;
          usersById[id] = safeUser;
        }

        const docs = await storage.getInternDocumentsByUserId(id);
        docsByUserId[id] = docs ?? null;
      }

      const enriched = onboardingList.map((onboarding) => ({
        user: usersById[onboarding.userId] ?? null,
        onboarding,
        documents: docsByUserId[onboarding.userId] ?? null,
      }));

      return res.json({ interns: enriched });
    } catch (error) {
      console.error("Interns list error:", error);
      return res.status(500).json({ message: "An error occurred while fetching interns" });
    }
  });

  // Employer registration endpoint - /employer/signup
  app.post("/api/auth/employer/signup", async (req, res) => {
    try {
      const validatedData = insertEmployerSchema.parse(req.body);

      const existingEmployer = await storage.getEmployerByEmail(
        validatedData.companyEmail,
      );
      if (existingEmployer) {
        return res.status(400).json({
          message: "An employer with this email already exists",
        });
      }

      const employer = await storage.createEmployer(validatedData);
      const { password, ...employerWithoutPassword } = employer;

      return res.status(201).json({
        message: "Employer account created successfully",
        employer: employerWithoutPassword,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }
      console.error("Employer signup error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred during employer registration" });
    }
  });

  // Employer login endpoint - /api/auth/employer/login
  app.post("/api/auth/employer/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      const employer = await storage.getEmployerByEmail(validatedData.email);
      if (!employer || employer.password !== validatedData.password) {
        return res
          .status(401)
          .json({ message: "Invalid email or password" });
      }

      const { password, ...safeEmployer } = employer;

      return res.status(200).json({
        message: "Employer login successful",
        employer: safeEmployer,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }
      console.error("Employer login error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred during employer login" });
    }
  });

  // User login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(validatedData.email);
      if (!user || user.password !== validatedData.password) {
        return res
          .status(401)
          .json({ message: "Invalid email or password" });
      }

      const { password, ...userWithoutPassword } = user;

      return res.status(200).json({
        message: "Login successful",
        user: userWithoutPassword,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }
      console.error("Login error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred during login" });
    }
  });

  // Admin login endpoint - /admin/login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      const admin = await storage.getAdminByEmail(validatedData.email);
      if (!admin || admin.password !== validatedData.password) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      const { password, ...adminWithoutPassword } = admin;

      return res.status(200).json({
        message: "Admin login successful",
        admin: adminWithoutPassword,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }
      console.error("Admin login error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred during admin login" });
    }
  });

  // ---------------------------------------------
  // Admin CRUD Endpoints
  // ---------------------------------------------

  // Admin: list all users
  app.get("/api/admin/users", async (_req, res) => {
    const users = await storage.getUsers();
    const safeUsers = users.map(({ password, ...rest }) => rest);
    return res.json({ users: safeUsers });
  });

  // Admin: get single user
  app.get("/api/admin/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...safeUser } = user;
    return res.json({ user: safeUser });
  });

  // Admin: update user
  app.put("/api/admin/users/:id", async (req, res) => {
    const updated = await storage.updateUser(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...safeUser } = updated;
    return res.json({ user: safeUser });
  });

  // Admin: delete user
  app.delete("/api/admin/users/:id", async (req, res) => {
    await storage.deleteUser(req.params.id);
    return res.status(204).send();
  });

  // Admin: list all employers
  app.get("/api/admin/employers", async (_req, res) => {
    const employers = await storage.getEmployers();
    const safeEmployers = employers.map(({ password, ...rest }) => rest);
    return res.json({ employers: safeEmployers });
  });

  // Admin: get single employer
  app.get("/api/admin/employers/:id", async (req, res) => {
    const employer = await storage.getEmployer(req.params.id);
    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }
    const { password, ...safeEmployer } = employer;
    return res.json({ employer: safeEmployer });
  });

  // Employer: change own password
  app.post("/api/employer/:id/change-password", async (req, res) => {
    try {
      const employerId = req.params.id;
      const body = changePasswordSchema.parse(req.body);

      const employer = await storage.getEmployer(employerId);
      if (!employer) {
        return res.status(404).json({ message: "Employer not found" });
      }

      if (employer.password !== body.currentPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const updated = await storage.updateEmployer(employerId, {
        password: body.newPassword,
      } as any);

      if (!updated) {
        return res.status(404).json({ message: "Employer not found" });
      }

      const { password, ...safeEmployer } = updated;
      return res.json({
        message: "Password updated successfully",
        employer: safeEmployer,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }
      console.error("Employer change password error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while changing password" });
    }
  });

  // Intern/User: change own password
  app.post("/api/users/:id/change-password", async (req, res) => {
    try {
      const userId = req.params.id;
      const body = changePasswordSchema.parse(req.body);

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.password !== body.currentPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const updated = await storage.updateUser(userId, {
        password: body.newPassword,
      } as any);

      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...safeUser } = updated as any;
      return res.json({
        message: "Password updated successfully",
        user: safeUser,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }
      console.error("User change password error:", error);
      return res.status(500).json({ message: "An error occurred while changing password" });
    }
  });

  // Admin: update employer
  app.put("/api/admin/employers/:id", async (req, res) => {
    const updated = await storage.updateEmployer(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Employer not found" });
    }
    const { password, ...safeEmployer } = updated;
    return res.json({ employer: safeEmployer });
  });

  // Admin: delete employer
  app.delete("/api/admin/employers/:id", async (req, res) => {
    await storage.deleteEmployer(req.params.id);
    return res.status(204).send();
  });

  // ---------------------------------------------
  // Employer Self + Projects Endpoints
  // ---------------------------------------------

  // Get employer by id (self view)
  app.get("/api/employer/:id", async (req, res) => {
    const employer = await storage.getEmployer(req.params.id);
    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }
    const { password, ...safeEmployer } = employer;
    return res.json({ employer: safeEmployer });
  });

  // Update company setup and mark setupCompleted
  app.put("/api/employer/:id/setup", async (req, res) => {
    try {
      const data = {
        companyName: req.body.companyName,
        websiteUrl: req.body.websiteUrl,
        companyEmail: req.body.companyEmail,
        companySize: req.body.companySize,
        city: req.body.city,
        state: req.body.state,
        primaryContactName: req.body.primaryContactName,
        primaryContactRole: req.body.primaryContactRole,
        escalationContactName: req.body.secondaryContactName,
        escalationContactEmail: req.body.secondaryContactEmail,
        escalationContactPhone: req.body.secondaryContactPhone,
        escalationContactRole: req.body.secondaryContactRole,
        bankName: req.body.bankName,
        accountNumber: req.body.accountNumber,
        accountHolderName: req.body.accountHolderName,
        ifscCode: req.body.ifscCode,
        swiftCode: req.body.swiftCode,
        gstNumber: req.body.gstNumber,
        setupCompleted: true,
      };

      const updated = await storage.updateEmployer(req.params.id, data as any);
      if (!updated) {
        return res.status(404).json({ message: "Employer not found" });
      }
      const { password, ...safeEmployer } = updated;
      return res.json({
        message: "Company setup saved",
        employer: safeEmployer,
      });
    } catch (error) {
      console.error("Employer setup update error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while saving company setup" });
    }
  });

  // Create/update onboarding project and mark onboardingCompleted
  app.put("/api/employer/:id/onboarding", async (req, res) => {
    try {
      const employerId = req.params.id;

      const employer = await storage.getEmployer(employerId);
      if (!employer) {
        return res.status(404).json({ message: "Employer not found" });
      }

      const projectPayload = {
        employerId,
        projectName: req.body.projectName,
        skills: req.body.skills ?? [],
        scopeOfWork: req.body.scopeOfWork,
        fullTimeOffer: req.body.fullTimeOffer ?? false,
        locationType: req.body.locationType,
        pincode: req.body.pincode,
        city: req.body.city,
        timezone: req.body.timezone,
      } as any;

      const project = await storage.createProject(projectPayload);

      const updatedEmployer = await storage.updateEmployer(employerId, {
        onboardingCompleted: true,
      } as any);

      const { password, ...safeEmployer } = updatedEmployer!;

      return res.json({
        message: "Onboarding completed",
        employer: safeEmployer,
        project,
      });
    } catch (error) {
      console.error("Employer onboarding error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while saving onboarding" });
    }
  });

  // Employer: deactivate own account (hard delete for now)
  app.post("/api/employer/:id/deactivate", async (req, res) => {
    try {
      const employerId = req.params.id;
      const employer = await storage.getEmployer(employerId);
      if (!employer) {
        return res.status(404).json({ message: "Employer not found" });
      }

      await storage.deleteEmployer(employerId);

      return res.json({
        message: "Employer account deactivated",
      });
    } catch (error) {
      console.error("Employer deactivate error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while deactivating account" });
    }
  });

  // List projects for an employer
  app.get("/api/employer/:id/projects", async (req, res) => {
    const projects = await storage.getProjectsByEmployerId(req.params.id);
    return res.json({ projects });
  });

  // Create a project for an employer
  app.post("/api/employer/:id/projects", async (req, res) => {
    try {
      const employerId = req.params.id;
      const payload = {
        employerId,
        projectName: req.body.projectName,
        skills: req.body.skills ?? [],
        scopeOfWork: req.body.scopeOfWork,
        fullTimeOffer: req.body.fullTimeOffer ?? false,
        locationType: req.body.locationType,
        pincode: req.body.pincode,
        city: req.body.city,
        timezone: req.body.timezone,
      } as any;

      const project = await storage.createProject(payload);
      return res.status(201).json({
        message: "Project created",
        project,
      });
    } catch (error) {
      console.error("Employer project create error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while creating project" });
    }
  });

  // Update a project
  app.put("/api/projects/:projectId", async (req, res) => {
    try {
      const updated = await storage.updateProject(
        req.params.projectId,
        req.body as any,
      );
      if (!updated) {
        return res.status(404).json({ message: "Project not found" });
      }
      return res.json({ message: "Project updated", project: updated });
    } catch (error) {
      console.error("Employer project update error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while updating project" });
    }
  });

  // Intern: list own interviews
  app.get("/api/intern/:internId/interviews", async (req, res) => {
    try {
      const internId = req.params.internId;
      const interviews = await storage.getInterviewsByInternId(internId);
      return res.json({ interviews: interviews.map(serializeInterview) });
    } catch (error) {
      console.error("List intern interviews error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while fetching interviews" });
    }
  });

  // Employer: create interview slots for an intern
  const createInterviewSchema = z.object({
    internId: z.string().min(1),
    projectId: z.string().nullable().optional(),
    timezone: z.string().min(1),
    slots: z.array(z.string().min(1)).length(3),
  });

  app.post("/api/employer/:employerId/interviews", async (req, res) => {
    try {
      const employerId = req.params.employerId;

      const employer = await storage.getEmployer(employerId);
      if (!employer) {
        return res.status(404).json({ message: "Employer not found" });
      }

      const data = createInterviewSchema.parse(req.body);

      const intern = await storage.getUser(data.internId);
      if (!intern) {
        return res.status(404).json({ message: "Intern not found" });
      }

      const parsedSlots = data.slots.map((s) => new Date(s));
      if (parsedSlots.some((d) => Number.isNaN(d.getTime()))) {
        return res.status(400).json({ message: "One or more slots are invalid" });
      }

      const internName = `${intern.firstName ?? ""} ${intern.lastName ?? ""}`.trim() || "Intern";
      const employerName = employer.companyName || employer.name || "Employer";

      let meetLinkWarning: string | null = null;
      let meetConnectUrl: string | null = null;
      if (!(await isGoogleConnectedForEmployer(employerId))) {
        meetLinkWarning = "Google Calendar is not connected for this employer";
        meetConnectUrl = getGoogleConnectUrl(employerId);
      }

      const interview = await storage.createInterview({
        employerId,
        internId: data.internId,
        projectId: data.projectId ?? null,
        timezone: data.timezone,
        status: "pending",
        slot1: parsedSlots[0],
        slot2: parsedSlots[1],
        slot3: parsedSlots[2],
        selectedSlot: null,
        meetingLink: meetConnectUrl,
        notes: null,
      } as any);

      return res.status(201).json({
        message: "Interview slots created",
        interview: serializeInterview(interview),
        meet: {
          created: false,
          warning: meetLinkWarning,
          connectUrl: meetConnectUrl,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }
      console.error("Create interview slots error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while creating interview slots" });
    }
  });

// Employer: list own interviews with basic intern & project info
app.get("/api/employer/:employerId/interviews", async (req, res) => {
  try {
    const employerId = req.params.employerId;

    const employer = await storage.getEmployer(employerId);
    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }

    const items = await storage.getInterviewsByEmployerId(employerId);

    const enriched = await Promise.all(
      items.map(async (i) => {
        const intern = await storage.getUser(i.internId).catch(() => undefined);
        const project = i.projectId
          ? await storage.getProject(i.projectId).catch(() => undefined)
          : undefined;

        const internName = intern
          ? `${intern.firstName ?? ""} ${intern.lastName ?? ""}`.trim() || "Intern"
          : "Intern";

        return {
          ...i,
          internName,
          projectName: project?.projectName ?? null,
          project_id: i.projectId ?? null,
          meet_link: i.meetingLink ?? null,
        };
      }),
    );

    return res.json({ interviews: enriched });
  } catch (error) {
    console.error("List employer interviews error:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching interviews" });
  }
});

  // Intern: select a slot
  const selectSlotSchema = z.object({
    slot: z.number().int().min(1).max(3),
  });

  app.post("/api/interviews/:id/select-slot", async (req, res) => {
    try {
      const interviewId = req.params.id;
      const body = selectSlotSchema.parse(req.body);

      const existing = await storage.getInterview(interviewId);
      if (!existing) {
        return res.status(404).json({ message: "Interview not found" });
      }

      const slotKey = `slot${body.slot}` as "slot1" | "slot2" | "slot3";
      const slotValue = (existing as any)[slotKey];
      if (!slotValue) {
        return res.status(400).json({ message: "Selected slot time is not set" });
      }

      const startTime = new Date(slotValue as any);
      if (Number.isNaN(startTime.getTime())) {
        return res.status(400).json({ message: "Selected slot time is invalid" });
      }

      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
      const timezone = existing.timezone || "Asia/Kolkata";

      const employer = await storage.getEmployer(existing.employerId).catch(() => undefined);
      const intern = await storage.getUser(existing.internId).catch(() => undefined);

      const internName = intern
        ? `${intern.firstName ?? ""} ${intern.lastName ?? ""}`.trim() || "Intern"
        : "Intern";
      const employerName = employer?.companyName || employer?.name || "Employer";

      const attendeeEmails = [
        employer?.companyEmail,
        intern?.email,
      ].filter((e): e is string => Boolean(e && String(e).trim()));

      let meetingLink = existing.meetingLink || null;
      let calendarEventId: string | null = existing.calendarEventId || null;
      let meetLinkWarning: string | null = null;
      let meetConnectUrl: string | null = null;
      if (!meetingLink) {
        if (!(await isGoogleConnectedForEmployer(existing.employerId))) {
          meetLinkWarning = "Google Calendar is not connected for this employer";
          meetConnectUrl = getGoogleConnectUrl(existing.employerId);
          meetingLink = null;
        } else {
          try {
            const { meetingLink: createdLink, eventId } = await createGoogleMeetLinkForEmployer({
              employerId: existing.employerId,
              summary: `Interview: ${employerName} x ${internName}`,
              description: `Interview scheduled between ${employerName} and ${internName}.`,
              startTime,
              endTime,
              timezone,
              attendees: attendeeEmails.map((email) => ({ email })),
            });
            meetingLink = createdLink;
            calendarEventId = eventId ?? null;
          } catch (meetError) {
            const info = formatGoogleApiError(meetError);
            meetLinkWarning = `${info.message}${info.status ? ` (status ${info.status})` : ""}${info.reason ? ` [${info.reason}]` : ""}`;
            if (info.message.includes("Google Calendar is not connected")) {
              meetConnectUrl = getGoogleConnectUrl(existing.employerId);
            } else {
              console.error("Create meeting link during slot selection error:", meetError);
            }
            meetingLink = null;
            calendarEventId = null;
          }
        }
      }

      const scheduled = await storage.updateInterviewScheduleWithMeetingLink(
        interviewId,
        body.slot,
        meetingLink,
        calendarEventId,
      );

      if (!scheduled) {
        return res.status(404).json({ message: "Interview not found" });
      }

      return res.json({
        message: "Slot selected",
        interview: serializeInterview(scheduled),
        meet: {
          created: Boolean(meetingLink),
          warning:
            meetingLink
              ? null
              : meetLinkWarning ??
                "Google Meet link could not be created (Google Calendar not connected or permission issue)",
          connectUrl: meetConnectUrl,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }
      console.error("Select interview slot error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while selecting interview slot" });
    }
  });

  // Employer: reschedule (reset to pending, clear selected slot)
  app.post("/api/interviews/:id/reschedule", async (req, res) => {
    try {
      const interviewId = req.params.id;

      const updated = await storage.resetInterviewToPending(interviewId);
      if (!updated) {
        return res.status(404).json({ message: "Interview not found" });
      }

      return res.json({
        message: "Interview reset to pending",
        interview: updated,
      });
    } catch (error) {
      console.error("Reschedule interview error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while rescheduling interview" });
    }
  });

  // Mark interview as missed (after selected slot + 15 min grace window)
  app.post("/api/interviews/:id/mark-missed", async (req, res) => {
    try {
      const interviewId = req.params.id;

      const interview = await storage.getInterview(interviewId);
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }

      if (interview.status !== "scheduled") {
        return res.status(400).json({ message: "Only scheduled interviews can be marked as missed" });
      }

      if (!interview.selectedSlot) {
        return res.status(400).json({ message: "No selected slot to evaluate for missed status" });
      }

      const selectedKey = `slot${interview.selectedSlot}` as keyof typeof interview;
      const slotValue = interview[selectedKey];

      if (!slotValue) {
        return res.status(400).json({ message: "Selected slot time is not set" });
      }

      const slotTime = new Date(slotValue as any);
      if (Number.isNaN(slotTime.getTime())) {
        return res.status(400).json({ message: "Selected slot time is invalid" });
      }

      const now = new Date();
      const graceMs = 15 * 60 * 1000;

      if (now.getTime() <= slotTime.getTime() + graceMs) {
        return res.status(400).json({ message: "Interview slot has not passed the grace window yet" });
      }

      const updated = await storage.updateInterviewStatus(interviewId, "missed");
      if (!updated) {
        return res.status(404).json({ message: "Interview not found" });
      }

      return res.json({
        message: "Interview marked as missed",
        interview: updated,
      });
    } catch (error) {
      console.error("Mark interview missed error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while marking interview as missed" });
    }
  });

  // ---------------------------------------------
  // Intern Onboarding Endpoints
  // ---------------------------------------------

  // Save/Update intern onboarding data
  app.post("/api/onboarding", async (req, res) => {
    try {
      const { userId, userEmail, ...rawOnboardingData } = req.body;

      if (!userId && !userEmail) {
        return res.status(400).json({ message: "User ID or userEmail is required" });
      }

      // Helper function to safely parse and ensure correct type
      const ensureArray = (val: any, fieldName: string): any[] => {
        console.log(`ensureArray[${fieldName}]: Input type=${typeof val}, isArray=${Array.isArray(val)}, value:`, JSON.stringify(val));

        // If it's already an array, return it
        if (Array.isArray(val)) {
          console.log(`ensureArray[${fieldName}]: Already array, returning as-is`);
          return val;
        }

        // If it's null or undefined, return empty array
        if (val == null) {
          console.log(`ensureArray[${fieldName}]: Value is null/undefined, returning empty array`);
          return [];
        }

        // If it's a JSON string, parse it
        if (typeof val === 'string') {
          // Check if it looks like JSON
          if (val.startsWith('[') || val.startsWith('{')) {
            try {
              const parsed = JSON.parse(val);
              console.log(`ensureArray[${fieldName}]: Parsed JSON string to:`, parsed);
              if (Array.isArray(parsed)) return parsed;
              if (typeof parsed === 'object') return [parsed];
            } catch (e) {
              console.log(`ensureArray[${fieldName}]: Failed to parse JSON string, error:`, e);
            }
          } else {
            console.log(`ensureArray[${fieldName}]: String doesn't look like JSON, treating as single value`);
            return [val];
          }
        }

        // If it's an object (but not an array), wrap it
        if (typeof val === 'object') {
          console.log(`ensureArray[${fieldName}]: Is object, wrapping in array`);
          return [val];
        }

        // Return empty array as fallback
        console.log(`ensureArray[${fieldName}]: Unexpected type, returning empty array`);
        return [];
      };

      // Helper function to safely handle objects
      const ensureObject = (val: any, fieldName: string): Record<string, any> => {
        console.log(`ensureObject[${fieldName}]: Input type=${typeof val}, isArray=${Array.isArray(val)}, value:`, JSON.stringify(val));

        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          console.log(`ensureObject[${fieldName}]: Already object, returning as-is`);
          return val;
        }

        if (val == null) {
          console.log(`ensureObject[${fieldName}]: Value is null/undefined, returning empty object`);
          return {};
        }

        if (typeof val === 'string') {
          if (val.startsWith('{') || val.startsWith('[')) {
            try {
              const parsed = JSON.parse(val);
              console.log(`ensureObject[${fieldName}]: Parsed JSON string to:`, parsed);
              if (typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
            } catch (e) {
              console.log(`ensureObject[${fieldName}]: Failed to parse JSON string, error:`, e);
            }
          }
        }

        console.log(`ensureObject[${fieldName}]: Unexpected type, returning empty object`);
        return {};
      };

      console.log("Raw request body:", JSON.stringify(rawOnboardingData, null, 2));

      // Ensure arrays and objects are properly formatted
      const onboardingData = {
        ...rawOnboardingData,
        experienceJson: ensureArray(rawOnboardingData.experienceJson, "experienceJson"),
        skills: ensureArray(rawOnboardingData.skills, "skills"),
        locationTypes: ensureArray(rawOnboardingData.locationTypes, "locationTypes"),
        preferredLocations: ensureArray(rawOnboardingData.preferredLocations, "preferredLocations"),
        extraData: ensureObject(rawOnboardingData.extraData, "extraData"),
      };

      console.log("Processed onboarding data:", JSON.stringify(onboardingData, null, 2));

      // Resolve effective user ID: prefer `userId`, fall back to lookup by `userEmail` if provided
      let effectiveUserId = userId;
      if (!effectiveUserId && userEmail) {
        const found = await storage.getUserByEmail(userEmail);
        if (!found) {
          return res.status(400).json({ message: "User not found for provided email. Please sign up or provide a valid email." });
        }
        effectiveUserId = found.id;
      }

      // Verify the user exists to avoid foreign key violations
      const user = await storage.getUser(effectiveUserId!);
      if (!user) {
        return res.status(400).json({ message: "User not found. Please sign up or provide a valid userId." });
      }

      // Check if onboarding already exists
      const existing = await storage.getInternOnboardingByUserId(effectiveUserId!);

      if (existing) {
        // Update existing
        const updated = await storage.updateInternOnboarding(effectiveUserId!, onboardingData);
        return res.status(200).json({
          message: "Onboarding updated successfully",
          onboarding: updated,
        });
      } else {
        // Create new
        const created = await storage.createInternOnboarding({
          userId: effectiveUserId!,
          ...onboardingData,
        });
        return res.status(201).json({
          message: "Onboarding saved successfully",
          onboarding: created,
        });
      }
    } catch (error) {
      console.error("Onboarding save error:", error);
      return res.status(500).json({
        message: "An error occurred while saving onboarding data",
      });
    }
  });

  // Get intern onboarding by user ID
  app.get("/api/onboarding/:userId", async (req, res) => {
    try {
      const [user, onboarding, internDocument] = await Promise.all([
        storage.getUser(req.params.userId),
        storage.getInternOnboardingByUserId(req.params.userId),
        storage.getInternDocumentsByUserId(req.params.userId),
      ]);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!onboarding) {
        return res.status(404).json({ message: "Onboarding data not found" });
      }

      const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        countryCode: user.countryCode,
        phoneNumber: user.phoneNumber,
        role: user.role,
      };

      return res.json({
        user: safeUser,
        onboarding,
        intern_document: internDocument ?? null,
      });
    } catch (error) {
      console.error("Onboarding get error:", error);
      return res.status(500).json({
        message: "An error occurred while fetching onboarding data",
      });
    }
  });

  // Get intern user by user ID
  app.get("/api/users/:userId", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        countryCode: user.countryCode,
        phoneNumber: user.phoneNumber,
        role: user.role,
      };

      return res.json({ user: safeUser });
    } catch (error) {
      console.error("User get error:", error);
      return res.status(500).json({ message: "An error occurred while fetching user data" });
    }
  });

  // Save/update intern document metadata
  app.post("/api/onboarding/documents", async (req, res) => {
    try {
      const { userId, ...rawDoc } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Ensure user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(400).json({ message: "User not found. Please sign up or provide a valid userId." });
      }

      // Validate shape; all fields are optional here
      const validated = insertInternDocumentsSchema.partial().parse({
        userId,
        ...rawDoc,
      });

      const saved = await storage.upsertInternDocumentsByUserId(userId, validated);

      return res.status(200).json({
        message: "Documents metadata saved successfully",
        documents: saved,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }
      console.error("Onboarding documents save error:", error);
      return res.status(500).json({
        message: "An error occurred while saving documents metadata",
      });
    }
  });

  // Get user by email (for recovery if userId is missing from localStorage)
  app.get("/api/auth/user/by-email/:email", async (req, res) => {
    try {
      const user = await storage.getUserByEmail(req.params.email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...safeUser } = user;
      return res.json({ user: safeUser });
    } catch (error) {
      console.error("Get user by email error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while fetching user" });
    }
  });

  // ---------------------------------------------
  // Proposals: create + list + status update
  // ---------------------------------------------

  const createProposalSchema = z.object({
    internId: z.string().min(1),
    projectId: z.string().min(1),
    interviewId: z.string().optional(),
    flowType: z.enum(["direct", "interview_first"]),
    status: z
      .enum(["draft", "sent", "accepted", "rejected", "interview_scheduled"])
      .optional(),
    offerDetails: z.record(z.any()).optional(),
    aiRatings: z
      .object({
        communication: z.number().optional(),
        coding: z.number().optional(),
        aptitude: z.number().optional(),
        overall: z.number().optional(),
      })
      .optional(),
    skills: z.array(z.string()).optional(),
  });

  // Employer: create a hiring proposal for an intern
  app.post("/api/employer/:employerId/proposals", async (req, res) => {
    try {
      const employerId = req.params.employerId;

      // Basic existence checks
      const employer = await storage.getEmployer(employerId);
      if (!employer) {
        return res.status(404).json({ message: "Employer not found" });
      }

      const data = createProposalSchema.parse(req.body);

      const intern = await storage.getUser(data.internId);
      if (!intern) {
        return res.status(404).json({ message: "Intern not found" });
      }

      const projects = await storage.getProjectsByEmployerId(employerId);
      const project = projects.find((p) => p.id === data.projectId);
      if (!project) {
        return res
          .status(400)
          .json({ message: "Project does not belong to this employer" });
      }

      const proposal = await storage.createProposal({
        employerId,
        internId: data.internId,
        projectId: data.projectId,
        flowType: data.flowType,
        status: data.status ?? "sent",
        offerDetails: data.offerDetails ?? {},
        aiRatings: data.aiRatings ?? {},
        skills: data.skills ?? [],
      } as any);

      return res.status(201).json({
        message: "Proposal created",
        proposal,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }
      console.error("Create proposal error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while creating proposal" });
    }
  });

  // Employer: list proposals they have sent
  app.get("/api/employer/:employerId/proposals", async (req, res) => {
    try {
      const employerId = req.params.employerId;
      const employer = await storage.getEmployer(employerId);
      if (!employer) {
        return res.status(404).json({ message: "Employer not found" });
      }

      const proposals = await storage.getProposalsByEmployerId(employerId);
      return res.json({ proposals });
    } catch (error) {
      console.error("List employer proposals error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while fetching proposals" });
    }
  });

  // Intern: list proposals received
  app.get("/api/intern/:internId/proposals", async (req, res) => {
    try {
      const internId = req.params.internId;
      const intern = await storage.getUser(internId);
      if (!intern) {
        return res.status(404).json({ message: "Intern not found" });
      }

      const proposals = await storage.getProposalsByInternId(internId);
      return res.json({ proposals });
    } catch (error) {
      console.error("List intern proposals error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while fetching proposals" });
    }
  });

  // Get single proposal by ID
  app.get("/api/proposals/:id", async (req, res) => {
    try {
      const proposal = await storage.getProposal(req.params.id);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      return res.json({ proposal });
    } catch (error) {
      console.error("Get proposal error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while fetching proposal" });
    }
  });

  // Employer: update proposal fields (offer details, skills, ratings, status)
  app.put("/api/proposals/:id", async (req, res) => {
    try {
      const updateSchema = createProposalSchema
        .partial()
        .extend({
          status: z
            .enum(["draft", "sent", "accepted", "rejected", "interview_scheduled"])
            .optional(),
        });

      const data = updateSchema.parse(req.body);

      const existing = await storage.getProposal(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      const updated = await storage.updateProposal(req.params.id, data as any);
      if (!updated) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      return res.json({
        message: "Proposal updated",
        proposal: updated,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }
      console.error("Update proposal error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while updating proposal" });
    }
  });

  // Intern: update proposal status (accept / reject etc.)
  app.patch("/api/proposals/:id/status", async (req, res) => {
    try {
      const statusSchema = z.enum([
        "draft",
        "sent",
        "accepted",
        "rejected",
        "interview_scheduled",
      ]);
      const status = statusSchema.parse(req.body.status);

      const updated = await storage.updateProposalStatus(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      return res.json({
        message: "Proposal status updated",
        proposal: updated,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }
      console.error("Update proposal status error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while updating proposal status" });
    }
  });

  return httpServer;
}
