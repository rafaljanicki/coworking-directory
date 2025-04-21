import type { APIGatewayProxyResult } from 'aws-lambda';

// Helper function to create standardized responses
export const createResponse = (statusCode: number, body: any): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
    },
    body: JSON.stringify(body)
  };
};

// Set environment variables for proper storage selection
export const setEnvironment = (): void => {
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';
};