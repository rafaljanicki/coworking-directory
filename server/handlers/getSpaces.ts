import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { storage } from '../storage';
import { createResponse, setEnvironment } from './utils';

// Get all spaces with optional filtering and pagination
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Set environment variables
    setEnvironment();
    
    const query = event.queryStringParameters || {};
    
    // Parse filter and bounds parameters
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
      // Parse bounds parameters
      north: query.north ? parseFloat(query.north) : undefined,
      south: query.south ? parseFloat(query.south) : undefined,
      east: query.east ? parseFloat(query.east) : undefined,
      west: query.west ? parseFloat(query.west) : undefined,
    };
    
    console.log('Getting spaces with options:', options);
    const { spaces } = await storage.getSpaces(options);
    
    // Return only the fetched spaces
    return createResponse(200, { spaces });
  } catch (error) {
    console.error("Error fetching spaces:", error);
    return createResponse(500, { message: "Failed to fetch coworking spaces" });
  }
};