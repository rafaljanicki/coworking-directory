import type { CoworkingSpace, PricingPackage, Service } from "@shared/schema";

// Filter state type
export interface FilterState {
  location?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  services: string[];
}

// Map marker type
export interface Marker {
  id: number;
  lat: number;
  lng: number;
  name: string;
  count?: number; // For clustered markers
}

// Space detail modal state
export interface SpaceModalState {
  isOpen: boolean;
  spaceId: number | null;
}

// Report changes modal state
export interface ReportModalState {
  isOpen: boolean;
  spaceId: number | null;
}

// Report changes form data
export interface ReportFormData {
  changeType: string;
  currentInfo: string;
  correctedInfo: string;
  additionalDetails: string;
  contactEmail?: string;
  spaceId: number;
}

// API response type for spaces
export interface SpacesResponse {
  spaces: CoworkingSpace[];
  total: number;
}

// Complete space with related data
export interface CompleteSpace extends CoworkingSpace {
  services: Service[];
  pricingPackages: PricingPackage[];
}
