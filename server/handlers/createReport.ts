import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { storage } from '../storage';
import { insertReportSchema } from '@shared/schema';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { createResponse, setEnvironment } from './utils';

// Create a new report
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Set environment variables
    setEnvironment();
    
    const body = event.body ? JSON.parse(event.body) : {};
    const reportData = insertReportSchema.parse(body);
    
    // Validate that the space exists
    const space = await storage.getSpaceById(reportData.spaceId);
    if (!space) {
      return createResponse(404, { message: "Coworking space not found" });
    }
    
    console.log('Creating report for space ID:', reportData.spaceId);
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