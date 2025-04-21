import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResponse, setEnvironment } from './utils';

// Health check endpoint handler
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Set environment variables
  setEnvironment();
  
  console.log('Health check requested:', event.path);
  return createResponse(200, { message: 'API is running' });
};