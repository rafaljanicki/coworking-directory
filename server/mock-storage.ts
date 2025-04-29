import { 
  CoworkingSpace, 
  InsertCoworkingSpace, 
  PricingPackage,
  InsertPricingPackage,
  Report,
  InsertReport,
} from "@shared/schema";
import { FilterOptions, IStorage } from "./storage";

// Mock data for development
const mockSpaces: CoworkingSpace[] = [
  {
    id: 1,
    name: "Business Link Warsaw",
    description: "Modern coworking space in the heart of Warsaw",
    city: "Warsaw",
    address: "Aleje Jerozolimskie 123",
    latitude: 52.2297,
    longitude: 21.0122,
    rating: 4.5,
    imageUrl: "https://via.placeholder.com/400x300?text=Business+Link",
    phone: "+48 22 100 00 00",
    email: "contact@businesslink.pl",
    website: "https://businesslink.pl",
    serviceIds: ["24_7_access", "wifi", "coffee_tea", "private_desks"],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 2,
    name: "O4 Coworking",
    description: "Creative coworking space in Gdansk",
    city: "Gdansk",
    address: "Długa 12",
    latitude: 54.3520,
    longitude: 18.6466,
    rating: 4.7,
    imageUrl: "https://via.placeholder.com/400x300?text=O4+Coworking",
    phone: "+48 58 100 00 00",
    serviceIds: ["wifi", "meeting_rooms", "printing"],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 3,
    name: "Strefa Startups",
    description: "Modern space for startups in Krakow",
    city: "Krakow",
    address: "Rynek Główny 1",
    latitude: 50.0617,
    longitude: 19.9373,
    rating: 4.3,
    imageUrl: "https://via.placeholder.com/400x300?text=Strefa+Startups",
    phone: "+48 12 100 00 00",
    serviceIds: ["wifi", "printing", "events_space"],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

const mockPackages: PricingPackage[] = [
  { 
    id: 1, 
    spaceId: 1, 
    name: "Day Pass", 
    description: "Access for one day",
    price: 50, 
    billingPeriod: "day",
    features: ["Access to open space", "WiFi", "Coffee & Tea"]
  },
  { 
    id: 2, 
    spaceId: 1, 
    name: "Flex Desk", 
    description: "Access to any available desk",
    price: 600, 
    billingPeriod: "month",
    features: ["24/7 access", "WiFi", "Meeting room credits (2h)", "Kitchen access"]
  },
  { 
    id: 3, 
    spaceId: 1, 
    name: "Fixed Desk", 
    description: "Your own dedicated desk",
    price: 900, 
    billingPeriod: "month",
    features: ["24/7 access", "WiFi", "Meeting room credits (5h)", "Kitchen access", "Mail handling"]
  },
  { 
    id: 4, 
    spaceId: 1, 
    name: "Private Desk", 
    description: "Your own private desk in a separated area",
    price: 1200, 
    billingPeriod: "month",
    features: ["24/7 access", "Private desk", "WiFi", "Meeting room credits (10h)", "Kitchen access", "Mail handling", "Locker"]
  },
  { 
    id: 5, 
    spaceId: 2, 
    name: "Day Pass", 
    description: "Access for one day",
    price: 45, 
    billingPeriod: "day",
    features: ["Access to open space", "WiFi", "Coffee & Tea"]
  },
  { 
    id: 6, 
    spaceId: 2, 
    name: "Private Desk", 
    description: "Your own private desk in a separated area",
    price: 1100, 
    billingPeriod: "month",
    features: ["24/7 access", "Private desk", "WiFi", "Meeting room credits (8h)", "Kitchen access", "Mail handling"]
  },
  { 
    id: 7, 
    spaceId: 3, 
    name: "Private Desk", 
    description: "Your own private desk in a separated area",
    price: 1050, 
    billingPeriod: "month",
    features: ["24/7 access", "Private desk", "WiFi", "Meeting room credits (5h)", "Kitchen access"]
  }
];

const mockReports: Report[] = [];

// Mock implementation of IStorage for development
export class MockStorage implements IStorage {
  async getSpaces(filters: FilterOptions = {}): Promise<{ spaces: CoworkingSpace[]; total: number }> {
    let filteredSpaces = [...mockSpaces];
    
    // Apply filters
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      filteredSpaces = filteredSpaces.filter(space => 
        space.city.toLowerCase().includes(locationLower) || 
        space.address.toLowerCase().includes(locationLower)
      );
    }
    
    if (filters.priceMin !== undefined) {
      // Find spaces with packages that meet the minimum price
      const spaceIds = mockPackages
        .filter(pkg => pkg.price >= filters.priceMin!)
        .map(pkg => pkg.spaceId);
      
      filteredSpaces = filteredSpaces.filter(space => spaceIds.includes(space.id));
    }
    
    if (filters.priceMax !== undefined) {
      // Find spaces with packages that meet the maximum price
      const spaceIds = mockPackages
        .filter(pkg => pkg.price <= filters.priceMax!)
        .map(pkg => pkg.spaceId);
      
      filteredSpaces = filteredSpaces.filter(space => spaceIds.includes(space.id));
    }
    
    if (filters.rating !== undefined) {
      filteredSpaces = filteredSpaces.filter(space => space.rating >= filters.rating!);
    }
    
    // Attach pricing packages
    filteredSpaces = filteredSpaces.map(space => {
      const packages = mockPackages.filter(pkg => pkg.spaceId === space.id);
      return {
        ...space,
        pricingPackages: packages,
        serviceIds: space.serviceIds || []
      };
    });
    
    // Filter by services if specified
    if (filters.services && filters.services.length > 0) {
      filteredSpaces = filteredSpaces.filter((space: any) => {
        const spaceServiceIds = space.serviceIds || [];
        return filters.services!.some(service => spaceServiceIds.includes(service));
      });
    }
    
    return { spaces: filteredSpaces, total: filteredSpaces.length };
  }
  
  async getSpaceById(id: number): Promise<CoworkingSpace | undefined> {
    const space = mockSpaces.find(s => s.id === id);
    if (!space) return undefined;
    
    // Get pricing packages for this space
    const packages = mockPackages.filter(pkg => pkg.spaceId === id);
    
    // Return the space with pricing attached, serviceIds should already be there
    return { 
      ...space, 
      pricingPackages: packages,
      serviceIds: space.serviceIds || [] 
    };
  }
  
  async createSpace(space: InsertCoworkingSpace): Promise<CoworkingSpace> {
    const id = mockSpaces.length + 1;
    const now = Date.now();
    const newSpace = { id, ...space, createdAt: now, updatedAt: now };
    mockSpaces.push(newSpace);
    return newSpace;
  }
  
  async updateSpace(id: number, space: Partial<InsertCoworkingSpace>): Promise<CoworkingSpace | undefined> {
    const index = mockSpaces.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    
    mockSpaces[index] = { 
      ...mockSpaces[index], 
      ...space, 
      updatedAt: Date.now() 
    };
    
    return mockSpaces[index];
  }
  
  async deleteSpace(id: number): Promise<boolean> {
    const index = mockSpaces.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    mockSpaces.splice(index, 1);
    return true;
  }
  
  async addServiceToSpace(spaceId: number, serviceStringId: string): Promise<boolean> {
    // Find the space
    const space = mockSpaces.find(s => s.id === spaceId);
    if (!space) {
      throw new Error(`Space with ID ${spaceId} not found`);
    }
    
    // Initialize serviceIds array if it doesn't exist
    if (!space.serviceIds) {
      space.serviceIds = [];
    }
    
    // Check if service is already associated
    if (space.serviceIds.includes(serviceStringId)) {
      return true; // Already exists
    }
    
    // Add the service string ID to the array
    space.serviceIds.push(serviceStringId);
    space.updatedAt = Date.now();
    
    return true;
  }
  
  async removeServiceFromSpace(spaceId: number, serviceStringId: string): Promise<boolean> {
    // Find the space
    const space = mockSpaces.find(s => s.id === spaceId);
    if (!space || !space.serviceIds) {
      return false; // No services to remove
    }
    
    // Check if service is associated
    if (!space.serviceIds.includes(serviceStringId)) {
      return false; // Service not found
    }
    
    // Remove the service string ID from the array
    space.serviceIds = space.serviceIds.filter(id => id !== serviceStringId);
    space.updatedAt = Date.now();
    
    return true;
  }
  
  async createReport(report: InsertReport): Promise<Report> {
    const id = mockReports.length + 1;
    const now = Date.now();
    const newReport = { 
      id, 
      ...report, 
      status: 'pending', 
      createdAt: now, 
      updatedAt: now 
    };
    mockReports.push(newReport as Report);
    return newReport as Report;
  }
  
  async getReports(): Promise<Report[]> {
    return mockReports;
  }
  
  async updateReportStatus(id: number, status: string): Promise<Report | undefined> {
    const index = mockReports.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    
    mockReports[index] = { 
      ...mockReports[index], 
      status, 
      updatedAt: Date.now() 
    };
    
    return mockReports[index];
  }
}