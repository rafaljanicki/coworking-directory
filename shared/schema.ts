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
