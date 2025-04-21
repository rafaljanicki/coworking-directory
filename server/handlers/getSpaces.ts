import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { storage } from '../storage';
import { createResponse, setEnvironment } from './utils';

// Get all spaces with optional filtering
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Set environment variables
    setEnvironment();
    
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
    
    console.log('Getting spaces with filters:', filters);
    const { spaces, total } = await storage.getSpaces(filters);
    
    return createResponse(200, { spaces, total });
  } catch (error) {
    console.error("Error fetching spaces:", error);
    return createResponse(500, { message: "Failed to fetch coworking spaces" });
  }
};