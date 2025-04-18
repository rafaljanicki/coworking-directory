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

export class MemStorage implements IStorage {
  private spaces: Map<number, CoworkingSpace>;
  private services: Map<number, Service>;
  private spaceServices: Map<number, Set<number>>;
  private pricingPackages: Map<number, PricingPackage>;
  private reports: Map<number, Report>;
  
  private spaceCounter: number;
  private serviceCounter: number;
  private packageCounter: number;
  private reportCounter: number;
  
  constructor() {
    this.spaces = new Map();
    this.services = new Map();
    this.spaceServices = new Map();
    this.pricingPackages = new Map();
    this.reports = new Map();
    
    this.spaceCounter = 1;
    this.serviceCounter = 1;
    this.packageCounter = 1;
    this.reportCounter = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }
  
  private initSampleData() {
    // Create services
    const servicesList = [
      { name: "High-speed WiFi", icon: "wifi" },
      { name: "24/7 Access", icon: "clock" },
      { name: "Meeting Rooms", icon: "users" },
      { name: "Coffee & Tea", icon: "coffee" },
      { name: "Printing Services", icon: "printer" },
      { name: "Phone Booths", icon: "phone" },
      { name: "Kitchen", icon: "utensils" },
      { name: "Events Space", icon: "calendar" },
      { name: "Parking", icon: "car" },
      { name: "Bike Storage", icon: "bicycle" },
      { name: "Showers", icon: "droplet" },
      { name: "Pet Friendly", icon: "paw" }
    ];
    
    servicesList.forEach(s => {
      this.createService({
        name: s.name,
        description: `Access to ${s.name.toLowerCase()}`,
        icon: s.icon
      });
    });
    
    // Create coworking spaces
    const spacesList = [
      {
        name: "Brain Embassy",
        city: "Warsaw",
        address: "Aleje Jerozolimskie 181B",
        latitude: 52.2100,
        longitude: 20.9662,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1497215842964-222b430dc094?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
        services: [1, 3, 4, 5, 7, 8],
        pricing: [
          {
            name: "Hot Desk",
            description: "Flexible desk in the open space area, access during business hours.",
            price: 950,
            billingPeriod: "month",
            features: ["Access 8am-8pm on weekdays", "10 hrs meeting room credits", "All amenities included"]
          },
          {
            name: "Dedicated Desk",
            description: "Your own permanent desk in the open space area with storage.",
            price: 1350,
            billingPeriod: "month",
            features: ["24/7 access", "20 hrs meeting room credits", "Lockable storage", "Business address service"]
          },
          {
            name: "Private Office",
            description: "Private enclosed office for teams of 2-8 people.",
            price: 2400,
            billingPeriod: "month",
            features: ["24/7 access", "40 hrs meeting room credits", "Customizable space"]
          },
          {
            name: "Day Pass",
            description: "Perfect for trying out the space or occasional visits.",
            price: 80,
            billingPeriod: "day",
            features: ["9am-6pm access", "2 hrs meeting room credit"]
          }
        ]
      },
      {
        name: "Business Link",
        city: "Kraków",
        address: "Pawia 9",
        latitude: 50.0647,
        longitude: 19.9450,
        rating: 4.6,
        imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
        services: [1, 2, 3, 4, 5, 7, 8, 9],
        pricing: [
          {
            name: "Coworking Membership",
            description: "Access to our collaborative workspace.",
            price: 900,
            billingPeriod: "month",
            features: ["Business hours access", "Community events", "Networking opportunities"]
          },
          {
            name: "Dedicated Desk",
            description: "Your personal workspace in our community.",
            price: 1250,
            billingPeriod: "month",
            features: ["24/7 access", "10 hrs meeting room credits", "Business address"]
          },
          {
            name: "Office Suite",
            description: "Private office space for 2-10 people.",
            price: 2800,
            billingPeriod: "month",
            features: ["24/7 access", "25 hrs meeting room credits", "Custom furniture options"]
          },
          {
            name: "Corporate Package",
            description: "Custom enterprise solutions for larger teams.",
            price: 4500,
            billingPeriod: "month",
            features: ["Custom space design", "Dedicated support staff", "Premium amenities"]
          }
        ]
      }
    ];
    
    spacesList.forEach(spaceData => {
      // Create space
      const space = this.createSpace({
        name: spaceData.name,
        city: spaceData.city,
        address: spaceData.address,
        latitude: spaceData.latitude,
        longitude: spaceData.longitude,
        rating: spaceData.rating,
        imageUrl: spaceData.imageUrl
      });
      
      // Assign services
      const serviceSet = new Set<number>(spaceData.services);
      this.spaceServices.set(space.id, serviceSet);
      
      // Create pricing packages
      spaceData.pricing.forEach(pkg => {
        this.createPricingPackage({
          spaceId: space.id,
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          billingPeriod: pkg.billingPeriod,
          features: pkg.features
        });
      });
    });
  }
  
  async getSpaces(filters: FilterOptions = {}): Promise<{ spaces: CoworkingSpace[], total: number }> {
    let filteredSpaces = Array.from(this.spaces.values());
    
    // Apply filters
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      filteredSpaces = filteredSpaces.filter(space => 
        space.city.toLowerCase().includes(locationLower) || 
        space.address.toLowerCase().includes(locationLower)
      );
    }
    
    if (filters.rating) {
      filteredSpaces = filteredSpaces.filter(space => 
        Number(space.rating) >= (filters.rating || 0)
      );
    }
    
    if (filters.services && filters.services.length > 0) {
      filteredSpaces = filteredSpaces.filter(space => {
        const spaceServiceIds = this.spaceServices.get(space.id);
        if (!spaceServiceIds) return false;
        
        // Convert service names to IDs for filtering
        const serviceIds = filters.services?.map(serviceName => {
          const service = Array.from(this.services.values()).find(
            s => s.name.toLowerCase().includes(serviceName.toLowerCase().replace('_', ' '))
          );
          return service?.id;
        }).filter(Boolean) as number[];
        
        // Check if space has all the required services
        return serviceIds.every(id => spaceServiceIds.has(id));
      });
    }
    
    // Price filtering is a bit more complex as it requires looking at pricing packages
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      filteredSpaces = filteredSpaces.filter(space => {
        // Get all pricing packages for this space
        const packages = Array.from(this.pricingPackages.values())
          .filter(pkg => pkg.spaceId === space.id);
        
        if (packages.length === 0) return false;
        
        // Check if any package falls within the price range
        return packages.some(pkg => {
          const price = Number(pkg.price);
          const minOk = filters.priceMin === undefined || price >= filters.priceMin;
          const maxOk = filters.priceMax === undefined || price <= filters.priceMax;
          return minOk && maxOk;
        });
      });
    }
    
    // Enrich spaces with services and pricing packages
    const enrichedSpaces = await Promise.all(
      filteredSpaces.map(async (space) => {
        const services = await this.getServicesBySpaceId(space.id);
        const pricingPackages = await this.getPricingPackagesBySpaceId(space.id);
        
        return {
          ...space,
          services,
          pricingPackages
        };
      })
    );
    
    return { spaces: enrichedSpaces, total: enrichedSpaces.length };
  }
  
  async getSpaceById(id: number): Promise<CoworkingSpace | undefined> {
    const space = this.spaces.get(id);
    if (!space) return undefined;
    
    const services = await this.getServicesBySpaceId(id);
    const pricingPackages = await this.getPricingPackagesBySpaceId(id);
    
    return {
      ...space,
      services,
      pricingPackages
    } as any;
  }
  
  async createSpace(space: InsertCoworkingSpace): Promise<CoworkingSpace> {
    const id = this.spaceCounter++;
    const newSpace: CoworkingSpace = {
      ...space,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.spaces.set(id, newSpace);
    this.spaceServices.set(id, new Set());
    
    return newSpace;
  }
  
  async updateSpace(id: number, space: Partial<InsertCoworkingSpace>): Promise<CoworkingSpace | undefined> {
    const existingSpace = this.spaces.get(id);
    if (!existingSpace) return undefined;
    
    const updatedSpace: CoworkingSpace = {
      ...existingSpace,
      ...space,
      updatedAt: new Date()
    };
    
    this.spaces.set(id, updatedSpace);
    return updatedSpace;
  }
  
  async deleteSpace(id: number): Promise<boolean> {
    const deleted = this.spaces.delete(id);
    
    // Also clean up related data
    if (deleted) {
      this.spaceServices.delete(id);
      
      // Remove pricing packages for this space
      for (const [pkgId, pkg] of this.pricingPackages.entries()) {
        if (pkg.spaceId === id) {
          this.pricingPackages.delete(pkgId);
        }
      }
    }
    
    return deleted;
  }
  
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }
  
  async getServicesBySpaceId(spaceId: number): Promise<Service[]> {
    const serviceIds = this.spaceServices.get(spaceId);
    if (!serviceIds) return [];
    
    return Array.from(serviceIds).map(id => this.services.get(id)!).filter(Boolean);
  }
  
  async createService(service: InsertService): Promise<Service> {
    const id = this.serviceCounter++;
    const newService: Service = {
      ...service,
      id
    };
    
    this.services.set(id, newService);
    return newService;
  }
  
  async getPricingPackagesBySpaceId(spaceId: number): Promise<PricingPackage[]> {
    return Array.from(this.pricingPackages.values())
      .filter(pkg => pkg.spaceId === spaceId);
  }
  
  async createPricingPackage(pkg: InsertPricingPackage): Promise<PricingPackage> {
    const id = this.packageCounter++;
    const newPackage: PricingPackage = {
      ...pkg,
      id
    };
    
    this.pricingPackages.set(id, newPackage);
    return newPackage;
  }
  
  async createReport(report: InsertReport): Promise<Report> {
    const id = this.reportCounter++;
    const newReport: Report = {
      ...report,
      id,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.reports.set(id, newReport);
    return newReport;
  }
  
  async getReports(): Promise<Report[]> {
    return Array.from(this.reports.values());
  }
  
  async updateReportStatus(id: number, status: string): Promise<Report | undefined> {
    const report = this.reports.get(id);
    if (!report) return undefined;
    
    const updatedReport: Report = {
      ...report,
      status,
      updatedAt: new Date()
    };
    
    this.reports.set(id, updatedReport);
    return updatedReport;
  }
}

