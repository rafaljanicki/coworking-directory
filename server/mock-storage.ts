import { 
  CoworkingSpace, 
  InsertCoworkingSpace, 
  Report,
  InsertReport,
} from "@shared/schema";
import { FilterOptions, IStorage } from "./storage";
import { BlogPost } from "@shared/schema";

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

const mockReports: Report[] = [];

// Add mock blog posts
const mockBlogPosts: BlogPost[] = [
  {
    id: "post-1",
    slug: "first-blog-post",
    title: "My First Blog Post",
    content: "<p>This is the content of the first blog post.</p>",
    author: "Admin",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    featuredImageUrl: "https://via.placeholder.com/800x400?text=First+Post",
    excerpt: "A short summary of the first post.",
    metaTitle: "My First Blog Post | SEO Title",
    metaDescription: "This is the meta description for the first blog post.",
    keywords: ["blog", "first post", "example"],
  },
  {
    id: "post-2",
    slug: "second-post-about-coworking",
    title: "Why Coworking is Great",
    content: "<p>Here are some reasons why coworking rocks!</p>",
    author: "Admin",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    excerpt: "Discover the benefits of coworking spaces.",
    metaTitle: "Why Coworking is Great | Blog",
    metaDescription: "Learn about the advantages of using shared office spaces.",
    keywords: ["coworking", "benefits", "productivity"],
  },
  // Added Polish blog post for the required slug
  {
    id: "post-3",
    slug: "coworking-dla-freelancera-korzysci-polska",
    title: "Coworking dla freelancera – korzyści w Polsce",
    content: `<p>Coworking to idealne rozwiązanie dla freelancerów, którzy szukają inspirującego miejsca do pracy poza domem. W Polsce coraz więcej osób decyduje się na wynajem biurka w przestrzeni coworkingowej, aby zwiększyć swoją produktywność i nawiązać nowe kontakty biznesowe.</p><ul><li><strong>Elastyczność</strong> – możesz pracować kiedy chcesz i jak chcesz.</li><li><strong>Networking</strong> – poznajesz innych profesjonalistów i potencjalnych klientów.</li><li><strong>Profesjonalne warunki</strong> – szybki internet, drukarki, sale konferencyjne.</li></ul><p>Dowiedz się więcej na naszym blogu!</p>`,
    author: "Anna Kowalska",
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    featuredImageUrl: "https://via.placeholder.com/800x400?text=Coworking+Freelancer",
    excerpt: "Poznaj najważniejsze korzyści coworkingu dla freelancerów w Polsce.",
    metaTitle: "Coworking dla freelancera – korzyści w Polsce | Blog",
    metaDescription: "Dowiedz się, dlaczego coworking to świetny wybór dla freelancerów w Polsce. Przeczytaj o elastyczności, networkingu i profesjonalnych warunkach.",
    keywords: ["coworking", "freelancer", "korzyści", "Polska"],
  },
];

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
    
    if (filters.rating !== undefined) {
      filteredSpaces = filteredSpaces.filter(space => space.rating >= filters.rating!);
    }
    
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
    
    // Return the space without pricing attached
    return { 
      ...space, 
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

  // --- Mock Blog Post Methods ---
  async getPosts(): Promise<{ posts: BlogPost[] }> {
    console.log("MockStorage: getPosts called");
    // Return a copy of the mock posts
    return { posts: [...mockBlogPosts] }; 
  }

  async getPostBySlug(slug: string): Promise<BlogPost | undefined> {
    console.log(`MockStorage: getPostBySlug called with slug: ${slug}`);
    const post = mockBlogPosts.find(p => p.slug === slug);
    return post ? { ...post } : undefined; // Return a copy if found
  }
  // --- End Mock Blog Post Methods ---
}