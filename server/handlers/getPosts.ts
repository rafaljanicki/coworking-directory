import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { storage } from '../storage';
import { createResponse, setEnvironment } from './utils';

// Get all blog posts
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    setEnvironment(); // Sets up env vars if needed
    console.log("Received event for getPosts handler:", event);

    // Currently no filtering/pagination, just fetch all
    const { posts } = await storage.getPosts();

    console.log(`Returning ${posts.length} posts.`);
    return createResponse(200, { posts });

  } catch (error) {
    console.error("Error fetching blog posts:", error);
    // Check if error is an instance of Error and has a message property
    const message = error instanceof Error ? error.message : "Failed to fetch blog posts";
    return createResponse(500, { message });
  }
}; 