import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResponse, setEnvironment } from './utils';

// Handle OPTIONS requests for CORS
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Set environment variables
  setEnvironment();
  
  console.log('Handling OPTIONS request for path:', event.path);
  return createResponse(200, {});
};