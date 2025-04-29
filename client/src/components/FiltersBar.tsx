import { Filter, MapPin, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterState } from "@/lib/types";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import React, { useState } from "react";
import { serviceIdToInfoMap } from "@/lib/services";

// Generate SERVICES array from the imported map
const ALL_SERVICES = Object.entries(serviceIdToInfoMap).map(([id, info]) => ({
  id: id,
  name: info.name,
  // icon: info.icon // Icon not needed for filter list, but available
}));

// Define type for service info
interface ServiceInfo {
  id: string;
  name: string;
}

interface FilterToggleProps {
  onToggleMap: () => void;
  isMapVisible: boolean;
  filters: FilterState;
  updateFilter: (key: keyof FilterState, value: any) => void;
  resetFilters: () => void;
  applyFilters: () => void;
}

const FiltersBar = ({ 
  onToggleMap, 
  isMapVisible, 
  filters, 
  updateFilter, 
  resetFilters, 
  applyFilters 
}: FilterToggleProps) => {
  const [showAllServices, setShowAllServices] = useState(false);
  
  // Displayed services (limited or all)
  const displayedServices = showAllServices 
    ? ALL_SERVICES 
    : ALL_SERVICES.slice(0, 5);
  
  return (
    <>
      {/* Mobile Filters Bar */}
      <div className="bg-white shadow-sm py-3 md:hidden">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
                <Filter className="mr-2 h-4 w-4" />
                Filtry
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Filtry</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <MobileFiltersContent 
                  filters={filters}
                  updateFilter={updateFilter}
                  displayedServices={displayedServices}
                  allServices={ALL_SERVICES}
                  showAllServices={showAllServices}
                  setShowAllServices={setShowAllServices}
                  resetFilters={resetFilters}
                  applyFilters={applyFilters}
                />
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Sortuj
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 rounded-full"
              onClick={onToggleMap}
            >
              <MapPin className="mr-2 h-4 w-4" />
              {isMapVisible ? "Lista" : "Mapa"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Desktop Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 hidden md:block">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Filtry</h2>
        </div>
        
        {/* Render the unified filter content component */}
        <MobileFiltersContent 
          filters={filters}
          updateFilter={updateFilter}
          displayedServices={displayedServices}
          allServices={ALL_SERVICES}
          showAllServices={showAllServices}
          setShowAllServices={setShowAllServices}
          resetFilters={resetFilters}
          applyFilters={applyFilters} 
        />
      </div>
    </>
  );
};

// Define Props for MobileFiltersContent
interface MobileFiltersContentProps {
  filters: FilterState;
  updateFilter: (key: keyof FilterState, value: any) => void;
  displayedServices: ServiceInfo[];
  allServices: ServiceInfo[];
  showAllServices: boolean;
  setShowAllServices: React.Dispatch<React.SetStateAction<boolean>>;
  resetFilters: () => void;
  applyFilters: () => void;
}

// Mobile Filters Content - used inside the Sheet component AND directly on desktop
const MobileFiltersContent = ({ 
  filters, 
  updateFilter, 
  displayedServices, 
  allServices,
  showAllServices, 
  setShowAllServices, 
  resetFilters, 
  applyFilters 
}: MobileFiltersContentProps) => {
  return (
    <div className="space-y-6">
      {/* Location filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Lokalizacja</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            type="text" 
            placeholder="Wyszukaj miasto lub obszar" 
            className="w-full pl-10 pr-4 py-2"
            value={filters.location || ''}
            onChange={(e) => updateFilter('location', e.target.value)}
            id="filter-location"
          />
        </div>
      </div>
      
      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Zakres cenowy (PLN)</label>
        <div className="flex items-center space-x-2">
          <Input 
            type="number" 
            placeholder="Min" 
            className="w-1/2"
            value={filters.priceMin || ''}
            onChange={(e) => updateFilter('priceMin', parseInt(e.target.value) || 0)}
            id="filter-price-min"
          />
          <span className="text-gray-500">-</span>
          <Input 
            type="number" 
            placeholder="Max" 
            className="w-1/2"
            value={filters.priceMax || ''}
            onChange={(e) => updateFilter('priceMax', parseInt(e.target.value) || 0)}
            id="filter-price-max"
          />
        </div>
      </div>
      
      {/* Ratings */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Minimalna ocena</label>
        <div className="flex space-x-2">
          <Button 
            variant={filters.rating === 3 ? "secondary" : "outline"} 
            className="flex items-center justify-center w-10 h-10 p-0"
            onClick={() => updateFilter('rating', filters.rating === 3 ? undefined : 3)}
            id="filter-rating-3"
          >
            3+
          </Button>
          <Button 
            variant={filters.rating === 4 ? "secondary" : "outline"} 
            className="flex items-center justify-center w-10 h-10 p-0"
            onClick={() => updateFilter('rating', filters.rating === 4 ? undefined : 4)}
            id="filter-rating-4"
          >
            4+
          </Button>
          <Button 
            variant={filters.rating === 5 ? "secondary" : "outline"} 
            className="flex items-center justify-center w-10 h-10 p-0"
            onClick={() => updateFilter('rating', filters.rating === 5 ? undefined : 5)}
            id="filter-rating-5"
          >
            5
          </Button>
        </div>
      </div>
      
      {/* Services */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Usługi</label>
        <div className="flex flex-col gap-2">
          {displayedServices.map((service) => (
            <label key={service.id} className="flex items-center">
              <Checkbox 
                checked={filters.services.includes(service.id)}
                id={`filter-service-${service.id}`}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFilter('services', [...filters.services, service.id]);
                  } else {
                    updateFilter(
                      'services', 
                      filters.services.filter(s => s !== service.id)
                    );
                  }
                }}
              />
              <span className="ml-2 text-sm text-gray-700">{service.name}</span>
            </label>
          ))}
        </div>
        {ALL_SERVICES.length > 5 && (
          <Button 
            variant="link" 
            className="text-sm text-primary font-medium mt-2 p-0 h-auto"
            onClick={() => setShowAllServices(!showAllServices)}
            id="filter-show-more-services"
          >
            {showAllServices ? "Pokaż mniej" : "Pokaż więcej usług"}
          </Button>
        )}
      </div>
      
      {/* Apply / Reset */}
      <div className="flex space-x-2 pt-4">
        <Button 
          variant="outline" 
          className="w-1/2"
          onClick={resetFilters}
          id="filter-reset-button"
        >
          Resetuj
        </Button>
        <Button 
          variant="default" 
          className="w-1/2 bg-primary text-white hover:bg-primary/90"
          onClick={() => {
            applyFilters();
            // Attempt to close the sheet if inside one (only works on mobile)
            const closeButton = document.querySelector(
              '[data-radix-dialog-content] button[aria-label="Close"]'
            ) as HTMLElement | null;
            closeButton?.click();
          }}
          id="filter-apply-button"
        >
          Zastosuj
        </Button>
      </div>
    </div>
  );
};

export default FiltersBar;
