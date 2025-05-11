/// <reference types="sst" />
import {
  CoworkingSpace,
  InsertCoworkingSpace,
  Report,
  InsertReport,
  BlogPost,
} from "@shared/schema";
// import AWS from "aws-sdk"; // Remove AWS SDK v2
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  ScanCommand, 
  GetCommand, 
  PutCommand, 
  UpdateCommand,
  QueryCommand,
  DeleteCommand // Added for completeness, though not used in original deleteSpace
} from "@aws-sdk/lib-dynamodb";
// import { Table } from "sst/node/table"; // Removed: SST v3 uses sst.resource
import { MockStorage } from "./mock-storage"; // Keep MockStorage for now

// Add bounds to filter options
export interface FilterOptions {
  location?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  services?: string[];
  north?: number;
  south?: number;
  east?: number;
  west?: number;
}

export interface IStorage {
  // Coworking spaces
  getSpaces(options?: FilterOptions): Promise<{ spaces: CoworkingSpace[] }>;
  getSpaceById(id: number): Promise<CoworkingSpace | undefined>;
  createSpace(space: InsertCoworkingSpace): Promise<CoworkingSpace>;
  updateSpace(id: number, space: Partial<InsertCoworkingSpace>): Promise<CoworkingSpace | undefined>;
  deleteSpace(id: number): Promise<boolean>;
  
  // Space Service management
  addServiceToSpace(spaceId: number, serviceStringId: string): Promise<boolean>;
  removeServiceFromSpace(spaceId: number, serviceStringId: string): Promise<boolean>;
  
  // Pricing Packages section removed
  
  // Reports
  createReport(report: InsertReport): Promise<Report>;
  getReports(): Promise<Report[]>;
  updateReportStatus(id: number, status: string): Promise<Report | undefined>;

  // Blog Posts
  getPosts(): Promise<{ posts: BlogPost[] }>;
  getPostBySlug(slug: string): Promise<BlogPost | undefined>;
}

// DynamoDB-based storage implementation using AWS SDK v3 and SST
export class DynamoStorage implements IStorage {
  // private client = new AWS.DynamoDB.DocumentClient(); // v2 client
  private docClient: DynamoDBDocumentClient;

  constructor() {
    const client = new DynamoDBClient({}); // v3 client
    this.docClient = DynamoDBDocumentClient.from(client);
  }

  async getSpaces(options: FilterOptions = {}): Promise<{ spaces: CoworkingSpace[] }> {
    const { north, south, east, west, ...otherFilters } = options;

    try {
      const params: any = { 
        TableName: process.env.COWORKING_SPACES_TABLE_NAME!,
      };

      const filterExpressions: string[] = [];
      const expressionAttributeValues: { [key: string]: any } = {};
      const expressionAttributeNames: { [key: string]: string } = {};
      // let nameCounter = 0; // Not strictly needed if placeholders are unique
      let valueCounter = 0; 

      const addValue = (value: any): string => {
        const placeholder = `:val${valueCounter++}`;
        expressionAttributeValues[placeholder] = value;
        return placeholder;
      };

      if (north !== undefined && south !== undefined && east !== undefined && west !== undefined) {
        expressionAttributeNames["#lat"] = "latitude";
        expressionAttributeNames["#lng"] = "longitude";
        filterExpressions.push(
          "#lat <= :north AND #lat >= :south AND #lng <= :east AND #lng >= :west"
        );
        expressionAttributeValues[":north"] = north;
        expressionAttributeValues[":south"] = south;
        expressionAttributeValues[":east"] = east;
        expressionAttributeValues[":west"] = west;
      }

      if (otherFilters.location) {
        expressionAttributeNames["#city"] = "city";
        expressionAttributeNames["#address"] = "address";
        const locationValPlaceholder = addValue(otherFilters.location);
        // Original logic had :locationVal, ensuring it refers to the generated placeholder
        filterExpressions.push(`(#city = ${locationValPlaceholder} OR contains(#address, ${locationValPlaceholder}))`);
      }

      if (otherFilters.rating !== undefined) {
        expressionAttributeNames["#rating"] = "rating";
        const ratingValPlaceholder = addValue(otherFilters.rating);
         // Original logic had :minRating
        filterExpressions.push(`#rating >= ${ratingValPlaceholder}`);
      }

      if (otherFilters.services && otherFilters.services.length > 0) {
        expressionAttributeNames["#serviceIds"] = "serviceIds";
        otherFilters.services.forEach((serviceId) => {
          const serviceValPlaceholder = addValue(serviceId);
          filterExpressions.push(`contains(#serviceIds, ${serviceValPlaceholder})`);
        });
      }

      if (filterExpressions.length > 0) {
        params.FilterExpression = filterExpressions.join(" AND ");
        params.ExpressionAttributeValues = expressionAttributeValues;
        if (Object.keys(expressionAttributeNames).length > 0) {
          params.ExpressionAttributeNames = expressionAttributeNames;
        }
        console.log("DynamoDB Scan Parameters (v3):", JSON.stringify(params, null, 2));
      } else {
        console.log("DynamoDB Scan without filters (v3)");
      }

      // const spaceResult = await this.client.scan(params).promise(); // v2
      const spaceResult = await this.docClient.send(new ScanCommand(params)); // v3
      let scannedSpaces = (spaceResult.Items || []) as CoworkingSpace[];

      console.log(`Scanned ${scannedSpaces.length} spaces from DynamoDB matching filters (excluding price).`);

      let priceFilteredSpaces = scannedSpaces;
      if (otherFilters.priceMin !== undefined || otherFilters.priceMax !== undefined) {
        priceFilteredSpaces = scannedSpaces.filter(space => {
          const packages = space.pricingPackages || [];
          if (packages.length === 0) {
            return otherFilters.priceMin === undefined || otherFilters.priceMin === 0;
          }
          return packages.some(pkg => {
            const price = pkg.price;
            const minMatch = otherFilters.priceMin === undefined || price >= otherFilters.priceMin;
            const maxMatch = otherFilters.priceMax === undefined || price <= otherFilters.priceMax;
            return minMatch && maxMatch;
          });
        });
        console.log(`Filtered down to ${priceFilteredSpaces.length} spaces after applying price range.`);
      }

      const formattedSpaces = priceFilteredSpaces.map(space => ({
        ...space,
        imageUrl: space.imageUrl || undefined,
        pricingPackages: space.pricingPackages || [],
      }));

      return { spaces: formattedSpaces };
    } catch (error) {
      console.error("DynamoDB error in getSpaces (v3):", error);
      throw new Error("Failed to fetch spaces from DynamoDB (v3)");
    }
  }
  
  async getSpaceById(id: number): Promise<CoworkingSpace | undefined> {
    try {
      // const result = await this.client.get({ TableName: this.tables.spaces, Key: { id } }).promise(); // v2
      const result = await this.docClient.send(new GetCommand({
        TableName: process.env.COWORKING_SPACES_TABLE_NAME!,
        Key: { id }
      })); // v3
      const space = result.Item as CoworkingSpace | undefined;
      
      // Ensure default values for optional fields if the space exists
      if (space) {
        return {
          ...space,
          imageUrl: space.imageUrl || undefined,
          pricingPackages: space.pricingPackages || [], // Default to empty array if missing from DB item
        };
      }
      
      return undefined; // Return undefined if space not found
    } catch (error) {
      console.error(`DynamoDB error in getSpaceById(${id}) (v3):`, error);
      throw new Error(`Failed to fetch space ${id} from DynamoDB (v3)`);
    }
  }
  
  async createSpace(spaceInput: InsertCoworkingSpace): Promise<CoworkingSpace> {
    const newId = Date.now(); 
    const now = Date.now();
    
    const newSpace: CoworkingSpace = {
      ...spaceInput,
      id: newId,
      rating: spaceInput.rating || 0,
      // Ensure embedded arrays default to empty if not provided
      serviceIds: spaceInput.serviceIds || [],
      pricingPackages: (spaceInput.pricingPackages || []).map((pkg: NonNullable<InsertCoworkingSpace['pricingPackages']>[number], index: number) => ({
        ...pkg,
        id: pkg.id || Date.now() + index
      })),
      createdAt: now,
      updatedAt: now,
    };

    try {
      // await this.client.put({ TableName: this.tables.spaces, Item: newSpace }).promise(); // v2
      await this.docClient.send(new PutCommand({
        TableName: process.env.COWORKING_SPACES_TABLE_NAME!,
        Item: newSpace,
      })); // v3
      return newSpace;
    } catch (error) {
      console.error("DynamoDB error in createSpace (v3):", error);
      // Add more specific error handling (e.g., conditional check failed)
      throw new Error("Failed to create space in DynamoDB (v3)");
    }
  }

  async updateSpace(id: number, spaceUpdate: Partial<InsertCoworkingSpace>): Promise<CoworkingSpace | undefined> {
    const now = Date.now();
    const updateExpressionParts: string[] = [];
    const expressionAttributeValues: { [key: string]: any } = { ':now': now };
    const expressionAttributeNames: { [key: string]: string } = {};

    for (const key in spaceUpdate) {
      if (Object.prototype.hasOwnProperty.call(spaceUpdate, key) && key !== 'id') {
        const attrKey = `#${key.replace(/[^a-zA-Z0-9_]/g, "")}`; // Sanitize key for attribute name
        const valKey = `:${key.replace(/[^a-zA-Z0-9_]/g, "")}`;
        updateExpressionParts.push(`${attrKey} = ${valKey}`);
        expressionAttributeNames[attrKey] = key;
        if (key === 'pricingPackages' && Array.isArray((spaceUpdate as any)[key])) {
          expressionAttributeValues[valKey] = ((spaceUpdate as any)[key] as NonNullable<InsertCoworkingSpace['pricingPackages']>).map((pkg: NonNullable<InsertCoworkingSpace['pricingPackages']>[number], index: number) => ({
            ...pkg,
            id: pkg.id || Date.now() + index + 1 
          }));
        } else {
          expressionAttributeValues[valKey] = (spaceUpdate as any)[key];
        }
      }
    }

    updateExpressionParts.push("#updatedAt = :now");
    expressionAttributeNames["#updatedAt"] = "updatedAt";

    if (updateExpressionParts.length === 0) {
      console.log("No fields to update for space", id);
      return this.getSpaceById(id); 
    }

    const updateExpression = `SET ${updateExpressionParts.join(', ')}`;

    try {
      // const result = await this.client.update({...}).promise(); // v2
      const result = await this.docClient.send(new UpdateCommand({
        TableName: process.env.COWORKING_SPACES_TABLE_NAME!,
        Key: { id },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
        // ConditionExpression: "attribute_exists(id)" // If needed
      })); // v3
      return result.Attributes as CoworkingSpace | undefined;
    } catch (error) {
      console.error(`DynamoDB error in updateSpace(${id}) (v3):`, error);
      // Add more specific error handling (e.g., conditional check failed)
      throw new Error(`Failed to update space ${id} in DynamoDB (v3)`);
    }
  }
  
  async deleteSpace(id: number): Promise<boolean> {
    // throw new Error("deleteSpace not implemented in DynamoStorage"); // Original
    try {
      await this.docClient.send(new DeleteCommand({
        TableName: process.env.COWORKING_SPACES_TABLE_NAME!,
        Key: { id },
      }));
      return true;
    } catch (error) {
      console.error(`DynamoDB error in deleteSpace(${id}) (v3):`, error);
      // Optionally, check for 'ConditionalCheckFailedException' if a condition was set
      return false; // Or throw error
    }
  }
  
  // Simplified space-service management using denormalized approach with string IDs
  async addServiceToSpace(spaceId: number, serviceStringId: string): Promise<boolean> {
    const params = {
      TableName: process.env.COWORKING_SPACES_TABLE_NAME!,
      Key: { id: spaceId },
      UpdateExpression: "ADD #serviceIds :serviceIdSet",
      ExpressionAttributeNames: {
        "#serviceIds": "serviceIds",
      },
      ExpressionAttributeValues: {
        ":serviceIdSet": new Set([serviceStringId]),
      },
      ReturnValues: "UPDATED_NEW" as const,
    };
    try {
      await this.docClient.send(new UpdateCommand(params));
      return true;
    } catch (error) {
      console.error(`Error adding service ${serviceStringId} to space ${spaceId}:`, error);
      return false;
    }
  }
  
  async removeServiceFromSpace(spaceId: number, serviceStringId: string): Promise<boolean> {
    const params = {
      TableName: process.env.COWORKING_SPACES_TABLE_NAME!,
      Key: { id: spaceId },
      UpdateExpression: "DELETE #serviceIds :serviceIdSet",
      ExpressionAttributeNames: {
        "#serviceIds": "serviceIds",
      },
      ExpressionAttributeValues: {
        ":serviceIdSet": new Set([serviceStringId]),
      },
      ReturnValues: "UPDATED_NEW" as const,
    };
    try {
      await this.docClient.send(new UpdateCommand(params));
      return true;
    } catch (error) {
      console.error(`Error removing service ${serviceStringId} from space ${spaceId}:`, error);
      return false;
    }
  }
  
  async createReport(report: InsertReport): Promise<Report> {
    const newId = Date.now();
    const now = Date.now(); 
    const newReport: Report = {
      ...report,
      id: newId,
      status: "pending", 
      createdAt: now,
      updatedAt: now,
    };
    try {
      await this.docClient.send(new PutCommand({
        TableName: process.env.REPORTS_TABLE_NAME!,
        Item: newReport,
      }));
      return newReport;
    } catch (error) {
      console.error("DynamoDB error in createReport:", error);
      throw new Error("Failed to create report in DynamoDB");
    }
  }

  async getReports(): Promise<Report[]> {
    try {
      const result = await this.docClient.send(new ScanCommand({
        TableName: process.env.REPORTS_TABLE_NAME!,
      }));
      return (result.Items || []) as Report[];
    } catch (error) {
      console.error("DynamoDB error in getReports:", error);
      throw new Error("Failed to fetch reports from DynamoDB");
    }
  }

  async updateReportStatus(id: number, status: string): Promise<Report | undefined> {
    const now = Date.now(); 
    const params = {
      TableName: process.env.REPORTS_TABLE_NAME!,
      Key: { id },
      UpdateExpression: "SET #status = :status, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#status": "status",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":status": status,
        ":updatedAt": now,
      },
      ReturnValues: "ALL_NEW" as const,
    };
    try {
      const result = await this.docClient.send(new UpdateCommand(params));
      return result.Attributes as Report | undefined;
    } catch (error) {
      console.error(`DynamoDB error in updateReportStatus(${id}):`, error);
      throw new Error("Failed to update report status in DynamoDB");
    }
  }

  // --- Blog Post Methods --- 

  async getPosts(): Promise<{ posts: BlogPost[] }> {
    try {
      const result = await this.docClient.send(new ScanCommand({
        TableName: process.env.BLOG_POSTS_TABLE_NAME!, 
      }));
      const posts = (result.Items || []) as BlogPost[];
      return { posts: posts.map(post => ({ ...post, content: post.content || '' })) };
    } catch (error) {
      console.error("DynamoDB error in getPosts (v3):", error);
      throw new Error("Failed to fetch posts from DynamoDB (v3)");
    }
  }

  async getPostBySlug(slug: string): Promise<BlogPost | undefined> {
    // Assumes 'slug' is a global secondary index partition key or needs a scan + filter if not.
    // For this example, we'll do a scan and filter. For production, a GSI on slug is better.
    // If you have a GSI named 'slug-index' on the BlogPosts table:
    /*
    const params = {
      TableName: process.env.BLOG_POSTS_TABLE_NAME!,
      IndexName: "slug-index", // Replace with your actual GSI name if you have one
      KeyConditionExpression: "slug = :slugVal",
      ExpressionAttributeValues: {
        ":slugVal": slug,
      },
    };
    try {
      const result = await this.docClient.send(new QueryCommand(params));
      const post = result.Items && result.Items.length > 0 ? (result.Items[0] as BlogPost) : undefined;
      return post ? { ...post, content: post.content || '' } : undefined;
    } catch (error) {
      console.error(`DynamoDB error in getPostBySlug(${slug}) (v3) with GSI:`, error);
      throw new Error(`Failed to fetch post by slug ${slug} from DynamoDB (v3)`);
    }
    */

    // Fallback to Scan if no GSI (less efficient)
    try {
      const scanParams = {
        TableName: process.env.BLOG_POSTS_TABLE_NAME!,
        FilterExpression: "slug = :slugVal",
        ExpressionAttributeValues: {
          ":slugVal": slug,
        },
      };
      const result = await this.docClient.send(new ScanCommand(scanParams));
      const post = result.Items && result.Items.length > 0 ? (result.Items[0] as BlogPost) : undefined;
      return post ? { ...post, content: post.content || '' } : undefined;
    } catch (error) {
      console.error(`DynamoDB error in getPostBySlug(${slug}) (v3) with Scan:`, error);
      throw new Error(`Failed to fetch post by slug ${slug} from DynamoDB (v3)`);
    }
  }

  // --- End Blog Post Methods ---
}

// For local development/testing when not using sst dev's live Lambda environment
// or for unit tests. `sst dev` typically uses the real DynamoStorage against
// a local emulator or deployed dev table.
const useMock = process.env.USE_MOCK_STORAGE === 'true' || process.env.NODE_ENV === 'test';

export const storage: IStorage = useMock ? new MockStorage() : new DynamoStorage();