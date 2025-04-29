import { 
  CoworkingSpace, 
  InsertCoworkingSpace, 
  Report,
  InsertReport,
} from "@shared/schema";
import AWS from "aws-sdk";
import { MockStorage } from "./mock-storage";

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
}

// DynamoDB-based storage implementation
export class DynamoStorage implements IStorage {
  private client = new AWS.DynamoDB.DocumentClient();
  private tables = {
    spaces: process.env.COWORKING_SPACES_TABLE!,
    reports: process.env.REPORTS_TABLE!,
  };
  
  async getSpaces(options: FilterOptions = {}): Promise<{ spaces: CoworkingSpace[] }> {
    const { north, south, east, west, ...otherFilters } = options;
    
    try {
      // --- Parameters for the scan operation ---
      const params: AWS.DynamoDB.DocumentClient.ScanInput = {
        TableName: this.tables.spaces,
      };

      // --- Build FilterExpression --- 
      // Warning: Geospatial filtering with Scan is inefficient.
      // Consider Geohashing + GSI or dedicated geospatial DB for production.
      const filterExpressions: string[] = [];
      const expressionAttributeValues: { [key: string]: any } = {};
      const expressionAttributeNames: { [key: string]: string } = {};

      // Add bounds filter if provided
      if (north !== undefined && south !== undefined && east !== undefined && west !== undefined) {
        filterExpressions.push(
          "#lat <= :north AND #lat >= :south AND #lng <= :east AND #lng >= :west"
        );
        expressionAttributeNames["#lat"] = "latitude";
        expressionAttributeNames["#lng"] = "longitude";
        expressionAttributeValues[":north"] = north;
        expressionAttributeValues[":south"] = south;
        expressionAttributeValues[":east"] = east;
        expressionAttributeValues[":west"] = west;
      }

      // TODO: Implement other filters (location, price, rating, services) based on otherFilters
      // Example for location:
      /*
      if (otherFilters.location) {
        filterExpressions.push("(#city = :location OR contains(#address, :location))"); // Ensure parentheses if mixing AND/OR
        expressionAttributeNames["#city"] = "city";
        expressionAttributeNames["#address"] = "address";
        expressionAttributeValues[":location"] = otherFilters.location;
      }
      */

      // Apply combined filter expression if any filters exist
      if (filterExpressions.length > 0) {
        params.FilterExpression = filterExpressions.join(" AND ");
        params.ExpressionAttributeValues = expressionAttributeValues;
        if (Object.keys(expressionAttributeNames).length > 0) {
          params.ExpressionAttributeNames = expressionAttributeNames;
        }
      }
       
      // --- Perform the scan --- 
      const spaceResult = await this.client.scan(params).promise();
      const spaces = (spaceResult.Items || []) as CoworkingSpace[]; // Pricing is now embedded

      // Return filtered spaces (no pagination)
      // Ensure imageUrl and pricingPackages have default values if needed, matching CoworkingSpace type
      const formattedSpaces = spaces.map(space => ({
        ...space,
        imageUrl: space.imageUrl || undefined, // Keep existing logic for imageUrl default
        pricingPackages: space.pricingPackages || [], // Default to empty array if missing from DB item
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
  
  async createSpace(_space: InsertCoworkingSpace): Promise<CoworkingSpace> {
    throw new Error("createSpace not implemented in DynamoStorage");
  }
  async updateSpace(_id: number, _space: Partial<InsertCoworkingSpace>): Promise<CoworkingSpace | undefined> {
    throw new Error("updateSpace not implemented in DynamoStorage");
  }
  async deleteSpace(_id: number): Promise<boolean> {
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
}

// Check if we are running locally (IS_OFFLINE is set by serverless-offline)
const isOffline = process.env.IS_OFFLINE === 'true';

// Use MockStorage if offline, otherwise use DynamoStorage
export const storage: IStorage = isOffline ? new MockStorage() : new DynamoStorage();