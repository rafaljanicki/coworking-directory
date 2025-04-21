import { 
  CoworkingSpace, 
  InsertCoworkingSpace, 
  Service,
  InsertService,
  PricingPackage,
  InsertPricingPackage,
  Report,
  InsertReport 
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

export interface IStorage {
  // Coworking spaces
  getSpaces(filters?: FilterOptions): Promise<{ spaces: CoworkingSpace[], total: number }>;
  getSpaceById(id: number): Promise<CoworkingSpace | undefined>;
  createSpace(space: InsertCoworkingSpace): Promise<CoworkingSpace>;
  updateSpace(id: number, space: Partial<InsertCoworkingSpace>): Promise<CoworkingSpace | undefined>;
  deleteSpace(id: number): Promise<boolean>;
  
  // Services
  getServices(): Promise<Service[]>;
  getServicesBySpaceId(spaceId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  
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
    spaceServices: process.env.SPACE_SERVICES_TABLE!,
    pricingPackages: process.env.PRICING_PACKAGES_TABLE!,
    reports: process.env.REPORTS_TABLE!,
  };
  
  async getSpaces(_filters: FilterOptions = {}): Promise<{ spaces: CoworkingSpace[]; total: number }> {
    try {
      const result = await this.client.scan({ TableName: this.tables.spaces }).promise();
      const spaces = (result.Items || []) as CoworkingSpace[];
      return { spaces, total: spaces.length };
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
  
  async getServicesBySpaceId(_spaceId: number): Promise<Service[]> {
    // Simplified: return all services
    return this.getServices();
  }
  
  async createService(_service: InsertService): Promise<Service> {
    throw new Error("createService not implemented in DynamoStorage");
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