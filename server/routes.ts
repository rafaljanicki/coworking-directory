import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReportSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

interface FilterQuery {
  location?: string;
  priceMin?: string;
  priceMax?: string;
  rating?: string;
  services?: string | string[];
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all coworking spaces with optional filtering
  app.get("/spaces", async (req: Request, res: Response) => {
    try {
      const query = req.query as FilterQuery;
      
      // Parse filter parameters
      const filters = {
        location: query.location,
        priceMin: query.priceMin ? Number(query.priceMin) : undefined,
        priceMax: query.priceMax ? Number(query.priceMax) : undefined,
        rating: query.rating ? Number(query.rating) : undefined,
        services: Array.isArray(query.services) 
          ? query.services 
          : query.services ? [query.services] : []
      };
      
      const { spaces, total } = await storage.getSpaces(filters);
      
      res.json({
        spaces,
        total
      });
    } catch (error) {
      console.error("Error fetching spaces:", error);
      res.status(500).json({ message: "Failed to fetch coworking spaces" });
    }
  });
  
  // Get a specific coworking space by ID
  app.get("/spaces/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid space ID" });
      }
      
      const space = await storage.getSpaceById(id);
      
      if (!space) {
        return res.status(404).json({ message: "Coworking space not found" });
      }
      
      res.json(space);
    } catch (error) {
      console.error("Error fetching space:", error);
      res.status(500).json({ message: "Failed to fetch coworking space" });
    }
  });
  
  // Get all services
  app.get("/services", async (_req: Request, res: Response) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });
  
  // Get services for a specific coworking space
  app.get("/spaces/:id/services", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid space ID" });
      }
      
      const services = await storage.getServicesBySpaceId(id);
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });
  
  // Get pricing packages for a specific coworking space
  app.get("/spaces/:id/pricing", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid space ID" });
      }
      
      const packages = await storage.getPricingPackagesBySpaceId(id);
      res.json(packages);
    } catch (error) {
      console.error("Error fetching pricing packages:", error);
      res.status(500).json({ message: "Failed to fetch pricing packages" });
    }
  });
  
  // Submit a report for a coworking space
  app.post("/reports", async (req: Request, res: Response) => {
    try {
      const reportData = insertReportSchema.parse(req.body);
      
      // Validate that the space exists
      const space = await storage.getSpaceById(reportData.spaceId);
      if (!space) {
        return res.status(404).json({ message: "Coworking space not found" });
      }
      
      const report = await storage.createReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof ZodError) {
        // Convert Zod validation error to a more user-friendly format
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to submit report" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
