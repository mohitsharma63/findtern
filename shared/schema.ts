import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  countryCode: text("country_code").notNull().default("+91"),
  phoneNumber: text("phone_number").notNull(),
  password: text("password").notNull(),
  agreedToTerms: boolean("agreed_to_terms").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
}).extend({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  countryCode: z.string().min(1, "Country code is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number too long"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agreedToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms & Conditions",
  }),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
