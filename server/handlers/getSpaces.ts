import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { storage } from '../storage';
import { createResponse, setEnvironment } from './utils';

// Get all spaces with optional filtering and pagination
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Set environment variables
    setEnvironment();
    
    const query = event.queryStringParameters || {};
    
    // Parse filter and pagination parameters
    const options = {
      location: query.location,
      priceMin: query.priceMin ? Number(query.priceMin) : undefined,
      priceMax: query.priceMax ? Number(query.priceMax) : undefined,
      rating: query.rating ? Number(query.rating) : undefined,
      services: query.services 
        ? Array.isArray(query.services) 
          ? query.services 
          : [query.services] 
        : [],
      limit: query.limit ? parseInt(query.limit, 10) : undefined, // Default handled in storage
      lastKey: query.lastKey ? JSON.parse(query.lastKey) : undefined // Parse lastKey from JSON string
    };
    
    console.log('Getting spaces with options:', options);
    const { spaces, lastKey } = await storage.getSpaces(options);
    
    // Return spaces and the lastKey for the next page
    return createResponse(200, { spaces, lastKey });
  } catch (error) {
    console.error("Error fetching spaces:", error);
    return createResponse(500, { message: "Failed to fetch coworking spaces" });
  }
};