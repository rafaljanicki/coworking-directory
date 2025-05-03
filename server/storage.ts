import { 
  CoworkingSpace, 
  InsertCoworkingSpace, 
  Report,
  InsertReport,
} from "@shared/schema";
import AWS from "aws-sdk";
import { MockStorage } from "./mock-storage";
import { BlogPost } from "@shared/schema";

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

// DynamoDB-based storage implementation
export class DynamoStorage implements IStorage {
  private client = new AWS.DynamoDB.DocumentClient();
  private tables = {
    spaces: process.env.COWORKING_SPACES_TABLE!,
    reports: process.env.REPORTS_TABLE!,
    blogPosts: process.env.BLOG_POSTS_TABLE!,
  };
  
  async getSpaces(options: FilterOptions = {}): Promise<{ spaces: CoworkingSpace[] }> {
    const { north, south, east, west, ...otherFilters } = options;
    
    try {
      // --- Parameters for the scan operation ---
      const params: AWS.DynamoDB.DocumentClient.ScanInput = {
        TableName: this.tables.spaces,
      };

      // --- Build FilterExpression ---
      const filterExpressions: string[] = [];
      const expressionAttributeValues: { [key: string]: any } = {};
      const expressionAttributeNames: { [key: string]: string } = {};
      let nameCounter = 0; // Counter for unique attribute name placeholders
      let valueCounter = 0; // Counter for unique attribute value placeholders

      // Helper to create unique value placeholder
      const addValue = (value: any): string => {
        const placeholder = `:val${valueCounter++}`;
        expressionAttributeValues[placeholder] = value;
        return placeholder;
      };

      // Add bounds filter if provided
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

      // --- Implement other filters ---

      // Location filter (matches city OR part of address)
      if (otherFilters.location) {
        expressionAttributeNames["#city"] = "city";
        expressionAttributeNames["#address"] = "address";
        const locationVal = addValue(otherFilters.location);
        filterExpressions.push("(#city = :locationVal OR contains(#address, :locationVal))");
        // Note: Manually alias :locationVal to the generated placeholder in values
        expressionAttributeValues[":locationVal"] = expressionAttributeValues[locationVal];
      }

      // Rating filter (greater than or equal to)
      if (otherFilters.rating !== undefined) {
        expressionAttributeNames["#rating"] = "rating";
        const ratingVal = addValue(otherFilters.rating);
        filterExpressions.push("#rating >= :minRating");
         // Note: Manually alias :minRating to the generated placeholder in values
        expressionAttributeValues[":minRating"] = expressionAttributeValues[ratingVal];
      }

      // Services filter (contains ALL specified services)
      if (otherFilters.services && otherFilters.services.length > 0) {
        expressionAttributeNames["#serviceIds"] = "serviceIds";
        otherFilters.services.forEach((serviceId, index) => {
          const serviceValPlaceholder = addValue(serviceId);
          filterExpressions.push(`contains(#serviceIds, ${serviceValPlaceholder})`);
        });
      }

      // Apply combined filter expression if any filters exist
      if (filterExpressions.length > 0) {
        params.FilterExpression = filterExpressions.join(" AND ");
        params.ExpressionAttributeValues = expressionAttributeValues;
        if (Object.keys(expressionAttributeNames).length > 0) {
          params.ExpressionAttributeNames = expressionAttributeNames;
        }
        console.log("DynamoDB Scan Parameters:", JSON.stringify(params, null, 2)); // Log generated params
      } else {
        console.log("DynamoDB Scan without filters (except potential bounds)");
      }

      // --- Perform the scan ---
      // Note: Scan can be slow and costly on large tables. Consider GSI for production.
      const spaceResult = await this.client.scan(params).promise();
      let scannedSpaces = (spaceResult.Items || []) as CoworkingSpace[];

      console.log(`Scanned ${scannedSpaces.length} spaces from DynamoDB matching filters (excluding price).`);

      // --- Post-scan filtering for Price Range ---
      let priceFilteredSpaces = scannedSpaces;
      if (otherFilters.priceMin !== undefined || otherFilters.priceMax !== undefined) {
        priceFilteredSpaces = scannedSpaces.filter(space => {
          const packages = space.pricingPackages || [];
          if (packages.length === 0) {
            // If no packages, only include if priceMin is 0 or undefined
            return otherFilters.priceMin === undefined || otherFilters.priceMin === 0;
          }

          return packages.some(pkg => {
            const price = pkg.price; // Assuming 'price' is the field name
            const minMatch = otherFilters.priceMin === undefined || price >= otherFilters.priceMin;
            const maxMatch = otherFilters.priceMax === undefined || price <= otherFilters.priceMax;
            return minMatch && maxMatch;
          });
        });
        console.log(`Filtered down to ${priceFilteredSpaces.length} spaces after applying price range.`);
      }

      // Ensure imageUrl and pricingPackages have default values if needed
      const formattedSpaces = priceFilteredSpaces.map(space => ({
        ...space,
        imageUrl: space.imageUrl || undefined,
        pricingPackages: space.pricingPackages || [],
      }));

      return { spaces: formattedSpaces };
    } catch (error) {
      console.error("DynamoDB error in getSpaces:", error);
      throw new Error("Failed to fetch spaces from DynamoDB");
    }
  }
  
  async getSpaceById(id: number): Promise<CoworkingSpace | undefined> {
    try {
      const result = await this.client.get({ TableName: this.tables.spaces, Key: { id } }).promise();
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
      console.error(`DynamoDB error in getSpaceById(${id}):`, error);
      throw new Error(`Failed to fetch space ${id} from DynamoDB`);
    }
  }
  
  async createSpace(spaceInput: InsertCoworkingSpace): Promise<CoworkingSpace> {
    // Basic implementation: generate ID, set defaults, put item
    // WARNING: ID generation might conflict in concurrent scenarios. Use UUIDs or atomic counters in production.
    const newId = Date.now(); // Simple ID generation, replace in production
    const now = Date.now();
    
    const newSpace: CoworkingSpace = {
      ...spaceInput,
      id: newId,
      rating: spaceInput.rating || 0,
      // Ensure embedded arrays default to empty if not provided
      serviceIds: spaceInput.serviceIds || [],
      pricingPackages: (spaceInput.pricingPackages || []).map((pkg, index) => ({ 
          ...pkg, 
          // Ensure each embedded package has an ID (simple sequential ID for now)
          id: pkg.id || Date.now() + index // Use existing ID or generate one
      })),
      createdAt: now,
      updatedAt: now,
    };

    try {
      await this.client.put({
        TableName: this.tables.spaces,
        Item: newSpace,
        // Optional: Add ConditionExpression to prevent overwriting existing ID if needed
        // ConditionExpression: "attribute_not_exists(id)"
      }).promise();
      return newSpace;
    } catch (error) {
      console.error("DynamoDB error in createSpace:", error);
      // Add more specific error handling (e.g., conditional check failed)
      throw new Error("Failed to create space in DynamoDB");
    }
  }

  async updateSpace(id: number, spaceUpdate: Partial<InsertCoworkingSpace>): Promise<CoworkingSpace | undefined> {
     // Basic implementation using UpdateItem
     // Note: This replaces the entire pricingPackages array if provided.
     // More granular updates (add/remove single package) require different logic.
    const now = Date.now();
    const updateExpressionParts: string[] = [];
    const expressionAttributeValues: { [key: string]: any } = { ':now': now };
    const expressionAttributeNames: { [key: string]: string } = {};

    // Build UpdateExpression dynamically based on fields in spaceUpdate
    for (const key in spaceUpdate) {
      if (Object.prototype.hasOwnProperty.call(spaceUpdate, key) && key !== 'id') {
        const attrKey = `#${key}`;
        const valKey = `:${key}`;
        updateExpressionParts.push(`${attrKey} = ${valKey}`);
        expressionAttributeNames[attrKey] = key;
        // Ensure pricingPackages have IDs if updating
        if (key === 'pricingPackages' && Array.isArray((spaceUpdate as any)[key])) {
           expressionAttributeValues[valKey] = ((spaceUpdate as any)[key] as any[]).map((pkg, index) => ({
             ...pkg,
             id: pkg.id || Date.now() + index
           }));
        } else {
           expressionAttributeValues[valKey] = (spaceUpdate as any)[key];
        }
      }
    }

    // Always update the 'updatedAt' timestamp
    updateExpressionParts.push("#updatedAt = :now");
    expressionAttributeNames["#updatedAt"] = "updatedAt";

    if (updateExpressionParts.length === 1) { // Only updatedAt is being updated
        console.warn(`updateSpace called for id ${id} with no fields to update.`);
        // Optionally fetch and return the current item or throw error
        return this.getSpaceById(id);
    }

    const updateExpression = `SET ${updateExpressionParts.join(', ')}`;

    try {
      const result = await this.client.update({
        TableName: this.tables.spaces,
        Key: { id },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW", // Return the updated item
        // Optional: Add ConditionExpression to ensure the item exists
        // ConditionExpression: "attribute_exists(id)"
      }).promise();
      
      return result.Attributes as CoworkingSpace | undefined;
    } catch (error) {
      console.error(`DynamoDB error in updateSpace(${id}):`, error);
      // Add more specific error handling (e.g., conditional check failed)
      throw new Error(`Failed to update space ${id} in DynamoDB`);
    }
  }
  
  async deleteSpace(_id: number): Promise<boolean> {
    // Keep existing stub or implement delete logic
    throw new Error("deleteSpace not implemented in DynamoStorage");
  }
  
  // Simplified space-service management using denormalized approach with string IDs
  async addServiceToSpace(spaceId: number, serviceStringId: string): Promise<boolean> {
    try {
      // 1. Get the space
      const space = await this.getSpaceById(spaceId);
      if (!space) {
        throw new Error(`Space with ID ${spaceId} not found`);
      }
      
      // 2. Initialize serviceIds array if it doesn't exist
      const serviceIds = space.serviceIds || [];
      
      // 3. Check if service is already associated
      if (serviceIds.includes(serviceStringId)) {
        return true; // Already exists
      }
      
      // 4. Add the service string ID to the array
      serviceIds.push(serviceStringId);
      
      // 5. Update the space with the new serviceIds array
      await this.client.update({
        TableName: this.tables.spaces,
        Key: { id: spaceId },
        UpdateExpression: 'SET serviceIds = :serviceIds, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':serviceIds': serviceIds,
          ':updatedAt': Date.now()
        }
      }).promise();
      
      return true;
    } catch (error) {
      console.error(`DynamoDB error in addServiceToSpace(${spaceId}, ${serviceStringId}):`, error);
      throw new Error(`Failed to add service ${serviceStringId} to space ${spaceId}`);
    }
  }
  
  async removeServiceFromSpace(spaceId: number, serviceStringId: string): Promise<boolean> {
    try {
      // 1. Get the space
      const space = await this.getSpaceById(spaceId);
      if (!space || !space.serviceIds) {
        return false; // No services to remove
      }
      
      // 2. Check if the service is associated
      if (!space.serviceIds.includes(serviceStringId)) {
        return false; // Service not found
      }
      
      // 3. Remove the service string ID from the array
      const updatedServiceIds = space.serviceIds.filter(id => id !== serviceStringId);
      
      // 4. Update the space with the modified serviceIds array
      await this.client.update({
        TableName: this.tables.spaces,
        Key: { id: spaceId },
        UpdateExpression: 'SET serviceIds = :serviceIds, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':serviceIds': updatedServiceIds,
          ':updatedAt': Date.now()
        }
      }).promise();
      
      return true;
    } catch (error) {
      console.error(`DynamoDB error in removeServiceFromSpace(${spaceId}, ${serviceStringId}):`, error);
      throw new Error(`Failed to remove service ${serviceStringId} from space ${spaceId}`);
    }
  }
  
  async createReport(report: InsertReport): Promise<Report> {
    try {
      const id = Date.now();
      const now = Date.now();
      const newReport = { id, ...report, status: 'pending', createdAt: now, updatedAt: now };
      await this.client.put({ TableName: this.tables.reports, Item: newReport }).promise();
      return newReport as unknown as Report;
    } catch (error) {
      console.error("DynamoDB error in createReport:", error);
      throw new Error("Failed to create report in DynamoDB");
    }
  }
  async getReports(): Promise<Report[]> {
    try {
      const result = await this.client.scan({ TableName: this.tables.reports }).promise();
      return (result.Items || []) as Report[];
    } catch (error) {
      console.error("DynamoDB error in getReports:", error);
      throw new Error("Failed to fetch reports from DynamoDB");
    }
  }
  async updateReportStatus(_id: number, _status: string): Promise<Report | undefined> {
    throw new Error("updateReportStatus not implemented in DynamoStorage");
  }

  // --- Blog Post Methods --- 

  async getPosts(): Promise<{ posts: BlogPost[] }> {
    try {
      const params: AWS.DynamoDB.DocumentClient.ScanInput = {
        TableName: this.tables.blogPosts,
        // Add projection expression to fetch only necessary fields for list view later if needed
        // Add pagination later if the number of posts grows
      };
      console.log("Scanning BlogPostsTable...");
      const result = await this.client.scan(params).promise();
      const posts = (result.Items || []) as BlogPost[];
      console.log(`Found ${posts.length} blog posts.`);
      return { posts };
    } catch (error) {
      console.error("DynamoDB error in getPosts:", error);
      throw new Error("Failed to fetch blog posts from DynamoDB");
    }
  }

  async getPostBySlug(slug: string): Promise<BlogPost | undefined> {
    try {
      const params: AWS.DynamoDB.DocumentClient.QueryInput = {
        TableName: this.tables.blogPosts,
        IndexName: "slug-index", // Use the GSI defined in template.yaml
        KeyConditionExpression: "slug = :slug",
        ExpressionAttributeValues: {
          ":slug": slug,
        },
        Limit: 1, // Expecting slug to be unique
      };
      console.log(`Querying BlogPostsTable for slug: ${slug}`);
      const result = await this.client.query(params).promise();
      
      if (result.Items && result.Items.length > 0) {
        const post = result.Items[0] as BlogPost;
        console.log(`Found post with slug: ${slug}, ID: ${post.id}`);
        return post;
      } else {
        console.log(`No post found with slug: ${slug}`);
        return undefined;
      }
    } catch (error) {
      console.error(`DynamoDB error in getPostBySlug(${slug}):`, error);
      throw new Error(`Failed to fetch blog post with slug ${slug} from DynamoDB`);
    }
  }

  // --- End Blog Post Methods ---
}

// Check if we are running locally (IS_OFFLINE is set by serverless-offline)
const isOffline = process.env.IS_OFFLINE === 'true';

// Use MockStorage if offline, otherwise use DynamoStorage
export const storage: IStorage = isOffline ? new MockStorage() : new DynamoStorage();