import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // User registration endpoint
  app.post("/api/auth/signup", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ 
          message: "An account with this email already exists" 
        });
      }

      // Create user (password should be hashed in production)
      const user = await storage.createUser(validatedData);
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json({ 
        message: "Account created successfully",
        user: userWithoutPassword 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed",
          errors: error.errors 
        });
      }
      console.error("Signup error:", error);
      return res.status(500).json({ 
        message: "An error occurred during registration" 
      });
    }
  });

  // User login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      // Validate request body
      const validatedData = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ 
          message: "Invalid email or password" 
        });
      }

      // Check password (in production, use bcrypt.compare)
      if (user.password !== validatedData.password) {
        return res.status(401).json({ 
          message: "Invalid email or password" 
        });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json({ 
        message: "Login successful",
        user: userWithoutPassword 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed",
          errors: error.errors 
        });
      }
      console.error("Login error:", error);
      return res.status(500).json({ 
        message: "An error occurred during login" 
      });
    }
  });

  return httpServer;
}
