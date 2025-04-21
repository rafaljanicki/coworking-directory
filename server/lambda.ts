import type {APIGatewayProxyEvent, Context, APIGatewayProxyResult, Handler, Callback} from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { createApp } from './app';

// Lazy init of serverless-express handler
let cachedHandler: Handler;

/**
 * Lambda handler entrypoint
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback
): Promise<APIGatewayProxyResult> => {
  try {
    if (!cachedHandler) {
      // Log the actual path from the API Gateway event
      console.log(`Lambda handler initialized with path: ${event.path}`);
      
      // Set NODE_ENV to ensure proper storage selection
      process.env.NODE_ENV = process.env.NODE_ENV || 'production';
      
      // Initialize Express app and wrap in serverless-express
      const app = await createApp();
      cachedHandler = serverlessExpress({ app });
    }
    
    // Log information about the incoming request
    console.log(`Processing request: ${event.httpMethod} ${event.path}`);
    
    // Delegate the event to the cached handler
    return cachedHandler(event, context, callback) as Promise<APIGatewayProxyResult>;
  } catch (error) {
    console.error("Error in Lambda handler:", error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }
};