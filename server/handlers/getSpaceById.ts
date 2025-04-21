import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { storage } from '../storage';
import { createResponse, setEnvironment } from './utils';

// Get a specific space by ID
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Set environment variables
    setEnvironment();
    
    const id = parseInt(event.pathParameters?.id || '');
    
    if (isNaN(id)) {
      return createResponse(400, { message: "Invalid space ID" });
    }
    
    console.log('Getting space by ID:', id);
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