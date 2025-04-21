import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { storage } from '../storage';
import { createResponse, setEnvironment } from './utils';

// Get all services
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Set environment variables
    setEnvironment();
    
    console.log('Getting all services');
    const services = await storage.getServices();
    return createResponse(200, services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return createResponse(500, { message: "Failed to fetch services" });
  }
};