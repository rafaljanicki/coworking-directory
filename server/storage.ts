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
    const result = await this.client.scan({ TableName: this.tables.spaces }).promise();
    const spaces = (result.Items || []) as CoworkingSpace[];
    return { spaces, total: spaces.length };
  }
  
  async getSpaceById(id: number): Promise<CoworkingSpace | undefined> {
    const result = await this.client.get({ TableName: this.tables.spaces, Key: { id } }).promise();
    return result.Item as CoworkingSpace | undefined;
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
    const result = await this.client.scan({ TableName: this.tables.services }).promise();
    return (result.Items || []) as Service[];
  }
  
  async getServicesBySpaceId(_spaceId: number): Promise<Service[]> {
    // Simplified: return all services
    return this.getServices();
  }
  
  async createService(_service: InsertService): Promise<Service> {
    throw new Error("createService not implemented in DynamoStorage");
  }
  
  async getPricingPackagesBySpaceId(_spaceId: number): Promise<PricingPackage[]> {
    const result = await this.client.scan({ TableName: this.tables.pricingPackages }).promise();
    return (result.Items || []) as PricingPackage[];
  }
  async createPricingPackage(_pkg: InsertPricingPackage): Promise<PricingPackage> {
    throw new Error("createPricingPackage not implemented in DynamoStorage");
  }
  
  async createReport(report: InsertReport): Promise<Report> {
    const id = Date.now();
    const now = Date.now();
    const newReport = { id, ...report, status: 'pending', createdAt: now, updatedAt: now };
    await this.client.put({ TableName: this.tables.reports, Item: newReport }).promise();
    return newReport as unknown as Report;
  }
  async getReports(): Promise<Report[]> {
    const result = await this.client.scan({ TableName: this.tables.reports }).promise();
    return (result.Items || []) as Report[];
  }
  async updateReportStatus(_id: number, _status: string): Promise<Report | undefined> {
    throw new Error("updateReportStatus not implemented in DynamoStorage");
  }
}
// Switch to DynamoDB storage by default
export const storage = new DynamoStorage();