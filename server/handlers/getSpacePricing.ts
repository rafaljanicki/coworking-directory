import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { storage } from '../storage';
import { createResponse, setEnvironment } from './utils';

// Get pricing for a specific space
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Set environment variables
    setEnvironment();
    
    const id = parseInt(event.pathParameters?.id || '');
    
    if (isNaN(id)) {
      return createResponse(400, { message: "Invalid space ID" });
    }
    
    console.log('Getting pricing packages for space ID:', id);
    const packages = await storage.getPricingPackagesBySpaceId(id);
    return createResponse(200, packages);
  } catch (error) {
    console.error("Error fetching pricing packages:", error);
    return createResponse(500, { message: "Failed to fetch pricing packages" });
  }
};