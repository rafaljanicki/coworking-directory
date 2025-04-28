import { 
  CoworkingSpace, 
  InsertCoworkingSpace, 
  Service,
  InsertService,
  PricingPackage,
  InsertPricingPackage,
  Report,
  InsertReport,
} from "@shared/schema";
import AWS from "aws-sdk";
import { MockStorage } from "./mock-storage";

export interface FilterOptions {
  location?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  services?: string[];
}

// Add pagination parameters
interface PaginationOptions {
  limit?: number;
  lastKey?: AWS.DynamoDB.DocumentClient.Key;
}

export interface IStorage {
  // Coworking spaces
  getSpaces(options?: FilterOptions & PaginationOptions): Promise<{ spaces: CoworkingSpace[], lastKey?: AWS.DynamoDB.DocumentClient.Key }>;
  getSpaceById(id: number): Promise<CoworkingSpace | undefined>;
  createSpace(space: InsertCoworkingSpace): Promise<CoworkingSpace>;
  updateSpace(id: number, space: Partial<InsertCoworkingSpace>): Promise<CoworkingSpace | undefined>;
  deleteSpace(id: number): Promise<boolean>;
  
  // Services
  getServices(): Promise<Service[]>;
  getServicesBySpaceId(spaceId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  
  // Space Service management
  addServiceToSpace(spaceId: number, serviceStringId: string): Promise<boolean>;
  removeServiceFromSpace(spaceId: number, serviceStringId: string): Promise<boolean>;
  
  // Pricing Packages
  getPricingPackagesBySpaceId(spaceId: number): Promise<PricingPackage[]>;
  createPricingPackage(pkg: InsertPricingPackage): Promise<PricingPackage>;
  
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
    services: process.env.SERVICES_TABLE!,
    pricingPackages: process.env.PRICING_PACKAGES_TABLE!,
    reports: process.env.REPORTS_TABLE!,
  };
  
  async getSpaces(options: FilterOptions & PaginationOptions = {}): Promise<{ spaces: CoworkingSpace[]; lastKey?: AWS.DynamoDB.DocumentClient.Key }> {
    const { limit = 10, lastKey: exclusiveStartKey, ..._filters } = options; // Default limit to 10
    
    try {
      // --- Parameters for the scan operation ---
      const params: AWS.DynamoDB.DocumentClient.ScanInput = {
        TableName: this.tables.spaces,
        Limit: limit,
      };
      if (exclusiveStartKey) {
        params.ExclusiveStartKey = exclusiveStartKey;
      }
      
      // TODO: Implement actual filtering based on _filters
      // Need to translate FilterOptions (location, priceMin etc.) into DynamoDB FilterExpressions
      // Example (needs refinement based on actual schema and desired logic):
      /*
      const filterExpressions: string[] = [];
      const expressionAttributeValues: { [key: string]: any } = {};
      const expressionAttributeNames: { [key: string]: string } = {};
      
      if (_filters.location) {
        filterExpressions.push("#city = :location OR contains(#address, :location)");
        expressionAttributeNames["#city"] = "city";
        expressionAttributeNames["#address"] = "address";
        expressionAttributeValues[":location"] = _filters.location;
      }
      // ... add more filters for price, rating, services ...
      
      if (filterExpressions.length > 0) {
        params.FilterExpression = filterExpressions.join(" AND ");
        params.ExpressionAttributeValues = expressionAttributeValues;
        if (Object.keys(expressionAttributeNames).length > 0) {
             params.ExpressionAttributeNames = expressionAttributeNames;
        }
      }
      */

      // --- Perform the scan --- 
      const spaceResult = await this.client.scan(params).promise();
      let spaces = (spaceResult.Items || []) as CoworkingSpace[];
      const lastEvaluatedKey = spaceResult.LastEvaluatedKey;

      // --- Fetch and attach pricing (only for the current page of spaces) ---
      if (spaces.length > 0) {
        // Inefficiently scan all pricing - consider GSI or BatchGetItem in production
        const pricingResult = await this.client.scan({ TableName: this.tables.pricingPackages }).promise();
        const allPricingPackages = (pricingResult.Items || []) as PricingPackage[];
        
        const pricingBySpaceId: { [key: number]: PricingPackage[] } = {};
        allPricingPackages.forEach(pkg => {
          if (!pricingBySpaceId[pkg.spaceId]) {
            pricingBySpaceId[pkg.spaceId] = [];
          }
          pricingBySpaceId[pkg.spaceId].push(pkg);
        });

        spaces = spaces.map(space => ({
          ...space,
          imageUrl: space.imageUrl || undefined,
          pricingPackages: pricingBySpaceId[space.id] || []
        }));
      }

      // Return only spaces and the key for the next page
      return { spaces, lastKey: lastEvaluatedKey };
    } catch (error) {
      console.error("DynamoDB error in getSpaces:", error);
      throw new Error("Failed to fetch spaces from DynamoDB");
    }
  }
  
  async getSpaceById(id: number): Promise<CoworkingSpace | undefined> {
    try {
      const result = await this.client.get({ TableName: this.tables.spaces, Key: { id } }).promise();
      return result.Item as CoworkingSpace | undefined;
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
  
  async getServices(): Promise<Service[]> {
    try {
      const result = await this.client.scan({ TableName: this.tables.services }).promise();
      return (result.Items || []) as Service[];
    } catch (error) {
      console.error("DynamoDB error in getServices:", error);
      throw new Error("Failed to fetch services from DynamoDB");
    }
  }
  
  async getServicesBySpaceId(spaceId: number): Promise<Service[]> {
    try {
      // 1. Get the space with its service string IDs
      const space = await this.getSpaceById(spaceId);
      if (!space || !space.serviceIds || space.serviceIds.length === 0) {
        return [];
      }
      
      // 2. Get all services
      const allServices = await this.getServices();
      
      // 3. Filter services by the string IDs stored in the space
      return allServices.filter(service => 
        space.serviceIds!.includes(service.serviceId || '')
      );
    } catch (error) {
      console.error(`DynamoDB error in getServicesBySpaceId(${spaceId}):`, error);
      throw new Error(`Failed to fetch services for space ${spaceId} from DynamoDB`);
    }
  }
  
  async createService(_service: InsertService): Promise<Service> {
    throw new Error("createService not implemented in DynamoStorage");
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
      
      // 4. Update the space with the filtered serviceIds array
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
  
  async getPricingPackagesBySpaceId(_spaceId: number): Promise<PricingPackage[]> {
    try {
      const result = await this.client.scan({ TableName: this.tables.pricingPackages }).promise();
      return (result.Items || []) as PricingPackage[];
    } catch (error) {
      console.error(`DynamoDB error in getPricingPackagesBySpaceId(${_spaceId}):`, error);
      throw new Error(`Failed to fetch pricing packages for space ${_spaceId} from DynamoDB`);
    }
  }
  async createPricingPackage(_pkg: InsertPricingPackage): Promise<PricingPackage> {
    throw new Error("createPricingPackage not implemented in DynamoStorage");
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

// Use appropriate storage implementation based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
console.log(`Using ${isDevelopment ? 'mock' : 'DynamoDB'} storage in ${process.env.NODE_ENV} environment`);

// Fall back to mock storage if AWS credentials are not properly configured
let selectedStorage: IStorage;
try {
  if (isDevelopment) {
    selectedStorage = new MockStorage();
  } else {
    // Check if tables are configured
    if (!process.env.COWORKING_SPACES_TABLE) {
      throw new Error("DynamoDB tables not configured");
    }
    selectedStorage = new DynamoStorage();
  }
} catch (err) {
  console.warn("Failed to initialize DynamoDB storage, falling back to mock data:", err);
  selectedStorage = new MockStorage();
}

export const storage = selectedStorage;