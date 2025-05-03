import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { storage } from '../storage';
import { createResponse, setEnvironment } from './utils';

// Get a single blog post by its slug
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    setEnvironment(); // Sets up env vars if needed
    console.log("Received event for getPostBySlug handler:", event);

    const slug = event.pathParameters?.slug;

    if (!slug) {
      console.warn("Slug path parameter is missing");
      return createResponse(400, { message: "Blog post slug is required" });
    }

    console.log(`Fetching post with slug: ${slug}`);
    const post = await storage.getPostBySlug(slug);

    if (!post) {
      console.log(`Post with slug ${slug} not found.`);
      return createResponse(404, { message: "Blog post not found" });
    }

    console.log(`Returning post with slug: ${slug}`);
    return createResponse(200, post);

  } catch (error) {
    console.error("Error fetching blog post by slug:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch blog post";
    return createResponse(500, { message });
  }
}; 