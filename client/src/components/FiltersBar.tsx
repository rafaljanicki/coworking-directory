import { Filter, MapPin, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useFilters } from "@/hooks/useFilters";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { useState } from "react";

// Common services to filter by
const SERVICES = [
  { id: "24_7_access", label: "24/7 Access" },
  { id: "wifi", label: "High-speed WiFi" },
  { id: "meeting_rooms", label: "Meeting Rooms" },
  { id: "coffee_tea", label: "Coffee & Tea" },
  { id: "printing", label: "Printing Services" },
  { id: "events_space", label: "Events Space" },
  { id: "kitchen", label: "Kitchen" },
  { id: "phone_booths", label: "Phone Booths" },
  { id: "parking", label: "Parking" },
];

interface FilterToggleProps {
  onToggleMap: () => void;
  isMapVisible: boolean;
}

const FiltersBar = ({ onToggleMap, isMapVisible }: FilterToggleProps) => {
  const { filters, updateFilter, resetFilters, applyFilters } = useFilters();
  const [showAllServices, setShowAllServices] = useState(false);
  
  // Displayed services (limited or all)
  const displayedServices = showAllServices 
    ? SERVICES 
    : SERVICES.slice(0, 5);
  
  return (
    <>
      {/* Mobile Filters Bar */}
      <div className="bg-white shadow-sm py-3 md:hidden">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <MobileFiltersContent 
                  filters={filters}
                  updateFilter={updateFilter}
                  displayedServices={displayedServices}
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
              Sort
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 rounded-full"
              onClick={onToggleMap}
            >
              <MapPin className="mr-2 h-4 w-4" />
              {isMapVisible ? "List" : "Map"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Desktop Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 hidden md:block">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Filters</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-600"
              onClick={resetFilters}
            >
              Reset
            </Button>
          </div>
        </div>
        
        <div className="space-y-5">
          {/* Location filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Search city or area" 
                className="w-full pl-10 pr-4 py-2"
                value={filters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value)}
              />
            </div>
          </div>
          
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (PLN)</label>
            <div className="flex items-center space-x-2">
              <Input 
                type="number" 
                placeholder="Min" 
                className="w-1/2"
                value={filters.priceMin || ''}
                onChange={(e) => updateFilter('priceMin', parseInt(e.target.value) || 0)}
              />
              <span className="text-gray-500">-</span>
              <Input 
                type="number" 
                placeholder="Max" 
                className="w-1/2"
                value={filters.priceMax || ''}
                onChange={(e) => updateFilter('priceMax', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          
          {/* Ratings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
            <div className="flex space-x-2">
              <Button 
                variant={filters.rating === 3 ? "secondary" : "outline"} 
                className="flex items-center justify-center w-10 h-10 p-0"
                onClick={() => updateFilter('rating', filters.rating === 3 ? undefined : 3)}
              >
                3+
              </Button>
              <Button 
                variant={filters.rating === 4 ? "secondary" : "outline"} 
                className="flex items-center justify-center w-10 h-10 p-0"
                onClick={() => updateFilter('rating', filters.rating === 4 ? undefined : 4)}
              >
                4+
              </Button>
              <Button 
                variant={filters.rating === 5 ? "secondary" : "outline"} 
                className="flex items-center justify-center w-10 h-10 p-0"
                onClick={() => updateFilter('rating', filters.rating === 5 ? undefined : 5)}
              >
                5
              </Button>
            </div>
          </div>
          
          {/* Services */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
            <div className="flex flex-col gap-2">
              {displayedServices.map((service) => (
                <label key={service.id} className="flex items-center">
                  <Checkbox 
                    checked={filters.services.includes(service.id)}
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
                  <span className="ml-2 text-sm text-gray-700">{service.label}</span>
                </label>
              ))}
            </div>
            <Button 
              variant="link" 
              className="text-sm text-primary font-medium mt-2 p-0 h-auto"
              onClick={() => setShowAllServices(!showAllServices)}
            >
              {showAllServices ? "Show less" : "Show more services"}
            </Button>
          </div>
          
          {/* Apply button */}
          <Button 
            className="w-full bg-primary text-white hover:bg-primary/90 mt-4"
            onClick={applyFilters}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  );
};

// Mobile Filters Content - used inside the Sheet component
const MobileFiltersContent = ({ 
  filters, 
  updateFilter, 
  displayedServices, 
  showAllServices, 
  setShowAllServices, 
  resetFilters, 
  applyFilters 
}: any) => {
  return (
    <div className="space-y-6">
      {/* Location filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            type="text" 
            placeholder="Search city or area" 
            className="w-full pl-10 pr-4 py-2"
            value={filters.location || ''}
            onChange={(e) => updateFilter('location', e.target.value)}
          />
        </div>
      </div>
      
      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (PLN)</label>
        <div className="flex items-center space-x-2">
          <Input 
            type="number" 
            placeholder="Min" 
            className="w-1/2"
            value={filters.priceMin || ''}
            onChange={(e) => updateFilter('priceMin', parseInt(e.target.value) || 0)}
          />
          <span className="text-gray-500">-</span>
          <Input 
            type="number" 
            placeholder="Max" 
            className="w-1/2"
            value={filters.priceMax || ''}
            onChange={(e) => updateFilter('priceMax', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>
      
      {/* Ratings */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
        <div className="flex space-x-2">
          <Button 
            variant={filters.rating === 3 ? "secondary" : "outline"} 
            className="flex items-center justify-center w-10 h-10 p-0"
            onClick={() => updateFilter('rating', filters.rating === 3 ? undefined : 3)}
          >
            3+
          </Button>
          <Button 
            variant={filters.rating === 4 ? "secondary" : "outline"} 
            className="flex items-center justify-center w-10 h-10 p-0"
            onClick={() => updateFilter('rating', filters.rating === 4 ? undefined : 4)}
          >
            4+
          </Button>
          <Button 
            variant={filters.rating === 5 ? "secondary" : "outline"} 
            className="flex items-center justify-center w-10 h-10 p-0"
            onClick={() => updateFilter('rating', filters.rating === 5 ? undefined : 5)}
          >
            5
          </Button>
        </div>
      </div>
      
      {/* Services */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
        <div className="space-y-2">
          {displayedServices.map((service: any) => (
            <label key={service.id} className="flex items-center">
              <Checkbox 
                checked={filters.services.includes(service.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFilter('services', [...filters.services, service.id]);
                  } else {
                    updateFilter(
                      'services', 
                      filters.services.filter((s: string) => s !== service.id)
                    );
                  }
                }}
              />
              <span className="ml-2 text-sm text-gray-700">{service.label}</span>
            </label>
          ))}
        </div>
        <Button 
          variant="link" 
          className="text-sm text-primary font-medium mt-2 p-0 h-auto"
          onClick={() => setShowAllServices(!showAllServices)}
        >
          {showAllServices ? "Show less" : "Show more"}
        </Button>
      </div>
      
      {/* Apply / Reset */}
      <div className="flex space-x-2 pt-4">
        <Button 
          variant="outline" 
          className="w-1/2"
          onClick={resetFilters}
        >
          Reset
        </Button>
        <Button 
          variant="default" 
          className="w-1/2 bg-primary text-white hover:bg-primary/90"
          onClick={() => {
            applyFilters();
            document.querySelector('[data-radix-scroll-area-close]')?.dispatchEvent(
              new MouseEvent('click', { bubbles: true })
            );
          }}
        >
          Apply
        </Button>
      </div>
    </div>
  );
};

export default FiltersBar;
