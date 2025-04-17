import type { APIGatewayProxyEvent, Context, APIGatewayProxyResult, Handler } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { createApp } from './app';

// Lazy init of serverless-express handler
let cachedHandler: Handler;

/**
 * Lambda handler entrypoint
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  if (!cachedHandler) {
    // Initialize Express app and wrap in serverless-express
    const app = await createApp();
    cachedHandler = serverlessExpress({ app });
  }
  // Delegate the event to the cached handler
  return cachedHandler(event, context) as Promise<APIGatewayProxyResult>;
};