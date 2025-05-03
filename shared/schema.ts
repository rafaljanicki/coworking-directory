import { z } from "zod";

// PricingPackage entity (defined first as it's used in CoworkingSpace)
export const pricingPackageSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  billingPeriod: z.string().default("month"),
  features: z.array(z.string()).default([]),
});

export const insertPricingPackageSchema = pricingPackageSchema.omit({ id: true });

// Zod schemas for DynamoDB-backed data models                                                                                                                                                          
// CoworkingSpace entity                                                                                                                                                                                
export const coworkingSpaceSchema = z.object({                                                                                                                                                          
  id: z.number(),                                                                                                                                                                                       
  name: z.string(),                                                                                                                                                                                     
  description: z.string().optional(),                                                                                                                                                                   
  city: z.string(),                                                                                                                                                                                     
  address: z.string(),                                                                                                                                                                                  
  latitude: z.number(),                                                                                                                                                                                 
  longitude: z.number(),                                                                                                                                                                                
  rating: z.number().default(0),                                                                                                                                                                        
  imageUrl: z.string().optional(),                                                                                                                                                                      
  phone: z.string().optional(),                                                                                                                                                                         
  email: z.string().optional(),                                                                                                                                                                         
  website: z.string().optional(),                                                                                                                                                                       
  locationDescription: z.string().optional(),
  // Services as an array of service string IDs directly on the space record (e.g., 'wifi', 'printing', etc.)
  serviceIds: z.array(z.string()).optional(),
  // Add pricing packages as an optional array
  pricingPackages: z.array(pricingPackageSchema).optional(),
  createdAt: z.union([z.number(), z.date()]),                                                                                                                                                           
  updatedAt: z.union([z.number(), z.date()]),                                                                                                                                                           
});                                                                                                                                                                                                     
                                                                                                                                                                                                        
// Schema for creating a new CoworkingSpace                                                                                                                                                             
export const insertCoworkingSpaceSchema = coworkingSpaceSchema                                                                                                                                       
  .omit({ id: true, createdAt: true, updatedAt: true })                                                                                                                                                 
  .extend({                                                                                                                                                                                             
    rating: z.number().default(0),                                                                                                                                                                      
  });                                                                                                                                                                                                   
                                                                                                                                                                                                        
// Report entity                                                                                                                                                                                        
export const reportSchema = z.object({                                                                                                                                                                  
  id: z.number(),                                                                                                                                                                                       
  spaceId: z.number(),                                                                                                                                                                                  
  changeType: z.string(),                                                                                                                                                                               
  currentInfo: z.string().optional(),                                                                                                                                                                   
  correctedInfo: z.string().optional(),                                                                                                                                                                 
  additionalDetails: z.string().optional(),                                                                                                                                                             
  contactEmail: z.string().optional(),                                                                                                                                                                  
  status: z.string().default("pending"),                                                                                                                                                                
  createdAt: z.union([z.number(), z.date()]),                                                                                                                                                           
  updatedAt: z.union([z.number(), z.date()]),                                                                                                                                                           
});                                                                                                                                                                                                     
                                                                                                                                                                                                        
// Schema for creating a new Report                                                                                                                                                                     
export const insertReportSchema = reportSchema.omit({                                                                                                                                                   
  id: true,                                                                                                                                                                                             
  status: true,                                                                                                                                                                                         
  createdAt: true,                                                                                                                                                                                      
  updatedAt: true,                                                                                                                                                                                      
});                                                                                                                                                                                                     
                                                                                                                                                                                                        

// TypeScript types                                                                                                                                                                                     
export type CoworkingSpace = z.infer<typeof coworkingSpaceSchema>;                                                                                                                                      
export type InsertCoworkingSpace = z.infer<typeof insertCoworkingSpaceSchema>;                                                                                                                          
                                                                                                                                                                                                        
export type PricingPackage = z.infer<typeof pricingPackageSchema>;                                                                                                                                      
export type InsertPricingPackage = z.infer<typeof insertPricingPackageSchema>;                                                                                                                          
                                                                                                                                                                                                        

export type Report = z.infer<typeof reportSchema>;                                                                                                                                                      
export type InsertReport = z.infer<typeof insertReportSchema>;

// Blog Post Schema (using Zod)
export const blogPostSchema = z.object({
  id: z.string(), // Partition key
  slug: z.string().regex(/^[a-z0-9-]+$/, { message: "Slug must be lowercase alphanumeric characters or hyphens" }), // Unique human-readable identifier
  title: z.string().min(1),
  content: z.string(), // HTML or Markdown content
  author: z.string().min(1),
  createdAt: z.string().datetime({ message: "Invalid ISO 8601 date format for createdAt" }), // ISO 8601 string
  updatedAt: z.string().datetime({ message: "Invalid ISO 8601 date format for updatedAt" }), // ISO 8601 string
  featuredImageUrl: z.string().url().optional(),
  excerpt: z.string().optional(), // Short summary

  // SEO Fields
  metaTitle: z.string().min(1), // SEO Title (often same as title, but can be optimized)
  metaDescription: z.string().min(1), // SEO Description
  keywords: z.array(z.string()).optional(), // SEO Keywords
});

// Schema for creating a new Blog Post
export const insertBlogPostSchema = blogPostSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Replace interface with inferred type
// export interface BlogPost { ... removed ... }
export type BlogPost = z.infer<typeof blogPostSchema>;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>; // Add type for inserting
