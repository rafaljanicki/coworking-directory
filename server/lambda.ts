import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import { storage } from './storage';
import { insertReportSchema } from '@shared/schema';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

// Helper function to create standardized responses
const createResponse = (statusCode: number, body: any): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
    },
    body: JSON.stringify(body)
  };
};

// Health check endpoint
export const healthCheck = async (): Promise<APIGatewayProxyResult> => {
  // Set NODE_ENV to ensure proper storage selection
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';
  return createResponse(200, { message: 'API is running' });
};

// Get all spaces with optional filtering
export const getSpaces = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Set NODE_ENV to ensure proper storage selection
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    
    const query = event.queryStringParameters || {};
    
    // Parse filter parameters
    const filters = {
      location: query.location,
      priceMin: query.priceMin ? Number(query.priceMin) : undefined,
      priceMax: query.priceMax ? Number(query.priceMax) : undefined,
      rating: query.rating ? Number(query.rating) : undefined,
      services: query.services 
        ? Array.isArray(query.services) 
          ? query.services 
          : [query.services] 
        : []
    };
    
    const { spaces, total } = await storage.getSpaces(filters);
    
    return createResponse(200, { spaces, total });
  } catch (error) {
    console.error("Error fetching spaces:", error);
    return createResponse(500, { message: "Failed to fetch coworking spaces" });
  }
};

// Get a specific space by ID
export const getSpaceById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Set NODE_ENV to ensure proper storage selection
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    
    const id = parseInt(event.pathParameters?.id || '');
    
    if (isNaN(id)) {
      return createResponse(400, { message: "Invalid space ID" });
    }
    
    const space = await storage.getSpaceById(id);
    
    if (!space) {
      return createResponse(404, { message: "Coworking space not found" });
    }
    
    return createResponse(200, space);
  } catch (error) {
    console.error("Error fetching space:", error);
    return createResponse(500, { message: "Failed to fetch coworking space" });
  }
};

// Get all services
export const getServices = async (): Promise<APIGatewayProxyResult> => {
  try {
    // Set NODE_ENV to ensure proper storage selection
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    
    const services = await storage.getServices();
    return createResponse(200, services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return createResponse(500, { message: "Failed to fetch services" });
  }
};

// Get services for a specific space
export const getSpaceServices = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Set NODE_ENV to ensure proper storage selection
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    
    const id = parseInt(event.pathParameters?.id || '');
    
    if (isNaN(id)) {
      return createResponse(400, { message: "Invalid space ID" });
    }
    
    const services = await storage.getServicesBySpaceId(id);
    return createResponse(200, services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return createResponse(500, { message: "Failed to fetch services" });
  }
};

// Get pricing for a specific space
export const getSpacePricing = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Set NODE_ENV to ensure proper storage selection
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    
    const id = parseInt(event.pathParameters?.id || '');
    
    if (isNaN(id)) {
      return createResponse(400, { message: "Invalid space ID" });
    }
    
    const packages = await storage.getPricingPackagesBySpaceId(id);
    return createResponse(200, packages);
  } catch (error) {
    console.error("Error fetching pricing packages:", error);
    return createResponse(500, { message: "Failed to fetch pricing packages" });
  }
};

// Create a new report
export const createReport = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Set NODE_ENV to ensure proper storage selection
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    
    const body = event.body ? JSON.parse(event.body) : {};
    const reportData = insertReportSchema.parse(body);
    
    // Validate that the space exists
    const space = await storage.getSpaceById(reportData.spaceId);
    if (!space) {
      return createResponse(404, { message: "Coworking space not found" });
    }
    
    const report = await storage.createReport(reportData);
    return createResponse(201, report);
  } catch (error) {
    if (error instanceof ZodError) {
      // Convert Zod validation error to a more user-friendly format
      const validationError = fromZodError(error);
      return createResponse(400, { message: validationError.message });
    }
    
    console.error("Error creating report:", error);
    return createResponse(500, { message: "Failed to submit report" });
  }
};

// Handle OPTIONS requests for CORS
export const handleOptions = async (): Promise<APIGatewayProxyResult> => {
  return createResponse(200, {});
};