import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { storage } from '../storage';
import { createResponse, setEnvironment } from './utils';

// Get services for a specific space
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Set environment variables
    setEnvironment();
    
    const id = parseInt(event.pathParameters?.id || '');
    
    if (isNaN(id)) {
      return createResponse(400, { message: "Invalid space ID" });
    }
    
    console.log('Getting services for space ID:', id);
    const services = await storage.getServicesBySpaceId(id);
    return createResponse(200, services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return createResponse(500, { message: "Failed to fetch services" });
  }
};