import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertEmployerSchema,
  insertInternDocumentsSchema,
} from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // ---------------------------------------------
  // Public Auth Endpoints
  // ---------------------------------------------

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
      const updated = await storage.updateProject(req.params.projectId, req.body as any);
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

  // Delete a project
  app.delete("/api/projects/:projectId", async (req, res) => {
    try {
      await storage.deleteProject(req.params.projectId);
      return res.status(204).send();
    } catch (error) {
      console.error("Employer project delete error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while deleting project" });
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
      const onboarding = await storage.getInternOnboardingByUserId(req.params.userId);
      if (!onboarding) {
        return res.status(404).json({ message: "Onboarding data not found" });
      }
      return res.json({ onboarding });
    } catch (error) {
      console.error("Onboarding get error:", error);
      return res.status(500).json({
        message: "An error occurred while fetching onboarding data",
      });
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

  return httpServer;
}
