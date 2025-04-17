import { pgTable, text, serial, integer, decimal, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Coworking spaces table
export const coworkingSpaces = pgTable("coworking_spaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  city: text("city").notNull(),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 9, scale: 6 }).notNull(),
  longitude: decimal("longitude", { precision: 9, scale: 6 }).notNull(),
  rating: decimal("rating", { precision: 3, scale: 1 }).notNull().default("0"),
  imageUrl: text("image_url"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  locationDescription: text("location_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Services available in coworking spaces
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
});

// Join table for coworking spaces and services
export const spaceServices = pgTable("space_services", {
  id: serial("id").primaryKey(),
  spaceId: integer("space_id").notNull().references(() => coworkingSpaces.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
});

// Pricing packages for coworking spaces
export const pricingPackages = pgTable("pricing_packages", {
  id: serial("id").primaryKey(),
  spaceId: integer("space_id").notNull().references(() => coworkingSpaces.id),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  billingPeriod: text("billing_period").notNull().default("month"),
  features: jsonb("features").default([]),
});

// Reports for incorrect information
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  spaceId: integer("space_id").notNull().references(() => coworkingSpaces.id),
  changeType: text("change_type").notNull(),
  currentInfo: text("current_info"),
  correctedInfo: text("corrected_info"),
  additionalDetails: text("additional_details"),
  contactEmail: text("contact_email"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertCoworkingSpaceSchema = createInsertSchema(coworkingSpaces).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export const insertPricingPackageSchema = createInsertSchema(pricingPackages).omit({
  id: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type CoworkingSpace = typeof coworkingSpaces.$inferSelect;
export type InsertCoworkingSpace = z.infer<typeof insertCoworkingSpaceSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type PricingPackage = typeof pricingPackages.$inferSelect;
export type InsertPricingPackage = z.infer<typeof insertPricingPackageSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
