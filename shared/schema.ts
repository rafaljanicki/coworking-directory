import { z } from "zod";

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
  createdAt: z.union([z.number(), z.date()]),                                                                                                                                                           
  updatedAt: z.union([z.number(), z.date()]),                                                                                                                                                           
});                                                                                                                                                                                                     
                                                                                                                                                                                                        
// Schema for creating a new CoworkingSpace                                                                                                                                                             
export const insertCoworkingSpaceSchema = coworkingSpaceSchema                                                                                                                                       
  .omit({ id: true, createdAt: true, updatedAt: true })                                                                                                                                                 
  .extend({                                                                                                                                                                                             
    rating: z.number().default(0),                                                                                                                                                                      
  });                                                                                                                                                                                                   
                                                                                                                                                                                                        
// Service entity                                                                                                                                                                                       
export const serviceSchema = z.object({                                                                                                                                                                 
  id: z.number(),                                                                                                                                                                                       
  name: z.string(),                                                                                                                                                                                     
  description: z.string().optional(),                                                                                                                                                                   
  icon: z.string().optional(),
  serviceId: z.string().optional(),                                                                                                                                                                         
});                                                                                                                                                                                                     
                                                                                                                                                                                                        
// Schema for creating a new Service                                                                                                                                                                    
export const insertServiceSchema = serviceSchema.omit({ id: true });                                                                                                                                    
                                                                                                                                                                                                        
// PricingPackage entity                                                                                                                                                                                
export const pricingPackageSchema = z.object({                                                                                                                                                          
  id: z.number(),                                                                                                                                                                                       
  spaceId: z.number(),                                                                                                                                                                                  
  name: z.string(),                                                                                                                                                                                     
  description: z.string().optional(),                                                                                                                                                                   
  price: z.number(),                                                                                                                                                                                    
  billingPeriod: z.string().default("month"),                                                                                                                                                           
  features: z.array(z.string()).default([]),                                                                                                                                                            
});                                                                                                                                                                                                     
                                                                                                                                                                                                        
// Schema for creating a new PricingPackage                                                                                                                                                             
export const insertPricingPackageSchema = pricingPackageSchema.omit({ id: true });                                                                                                                      
                                                                                                                                                                                                        
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
                                                                                                                                                                                                        
export type Service = z.infer<typeof serviceSchema>;                                                                                                                                                    
export type InsertService = z.infer<typeof insertServiceSchema>;                                                                                                                                        
                                                                                                                                                                                                        
export type PricingPackage = z.infer<typeof pricingPackageSchema>;                                                                                                                                      
export type InsertPricingPackage = z.infer<typeof insertPricingPackageSchema>;                                                                                                                          
                                                                                                                                                                                                        
export type Report = z.infer<typeof reportSchema>;                                                                                                                                                      
export type InsertReport = z.infer<typeof insertReportSchema>;
