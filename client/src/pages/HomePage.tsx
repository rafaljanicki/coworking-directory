import { useState, useEffect, useCallback, useRef } from "react";
import Header from "@/components/Header";
import FiltersBar from "@/components/FiltersBar";
import SpacesList from "@/components/SpacesList";
import MapView from "@/components/MapView";
import SpaceDetailModal from "@/components/SpaceDetailModal";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { HomePageSEO } from "@/components/SEO";
import { useSpaces } from "@/hooks/useSpaces";
import { CoworkingSpace } from "@shared/schema";
import type L from 'leaflet';

// Simple debounce hook (copied from MapView)
const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => { return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }; }, []);
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => { callback(...args); }, delay);
    },
    [callback, delay]
  );
  return debouncedCallback;
};

const HomePage = () => {
  const isMobile = useIsMobile();
  const { 
    allSpaces,
    isLoading, 
    error, 
  } = useSpaces();
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [visibleSpaces, setVisibleSpaces] = useState<CoworkingSpace[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(true);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  
  // Wrap handler in useCallback to stabilize its reference
  const handleSpaceSelect = useCallback((id: number) => {
    setSelectedSpaceId(id);
    setIsDetailModalOpen(true);
  }, []); // Dependencies: setSelectedSpaceId, setIsDetailModalOpen (stable)
  
  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedSpaceId(null);
  };
  
  // Wrap callback for stability
  const toggleMapView = useCallback(() => {
    setIsMapVisible(!isMapVisible);
  }, [isMapVisible]);
  
  // Wrap callback for stability
  const toggleMapExpand = useCallback(() => {
    setIsMapExpanded(!isMapExpanded);
  }, [isMapExpanded]);

  // Extract unique cities for SEO
  useEffect(() => {
    if (allSpaces && allSpaces.length > 0) {
      // Get unique cities using filter and indexOf
      const uniqueCities = allSpaces
        .map(space => space.city)
        .filter((city, index, self) => self.indexOf(city) === index);
      setCities(uniqueCities);
    }
  }, [allSpaces]);
  
  // Filter spaces based on map bounds
  useEffect(() => {
    if (!mapBounds || !allSpaces || allSpaces.length === 0) {
      setVisibleSpaces(allSpaces || []); // Show all if no bounds or no spaces
      return;
    }
    
    const visible = allSpaces.filter(space => {
      if (!space.latitude || !space.longitude) return false;
      const lat = typeof space.latitude === 'string' ? parseFloat(space.latitude) : space.latitude;
      const lng = typeof space.longitude === 'string' ? parseFloat(space.longitude) : space.longitude;
      if (isNaN(lat) || isNaN(lng)) return false;
      
      return (
        lat >= mapBounds.getSouth() && 
        lat <= mapBounds.getNorth() && 
        lng >= mapBounds.getWest() && 
        lng <= mapBounds.getEast()
      );
    });
    
    setVisibleSpaces(currentVisibleSpaces => {
      const currentIds = currentVisibleSpaces.map(s => s.id).join(',');
      const newIds = visible.map(s => s.id).join(',');
      if (currentIds === newIds) {
        return currentVisibleSpaces; // Keep the old reference if IDs are the same
      }
      return visible; // Otherwise, update with the new array reference
    });
  }, [allSpaces, mapBounds]);
  
  // Raw state setter
  const updateBoundsState = useCallback((bounds: L.LatLngBounds) => {
    setMapBounds(bounds);
  }, []);
  
  // Debounced version of the state setter to pass to MapView
  const handleBoundsChange = useDebouncedCallback(updateBoundsState, 300);
  
  return (
    <>
      <HomePageSEO spaces={allSpaces?.length || 0} cities={cities} />
      <Header />
      
      <div className="container mx-auto px-4 py-4">
        {/* Mobile Filters Bar - only shown on mobile */}
        <div className="md:hidden mb-4">
          <FiltersBar 
            onToggleMap={toggleMapView}
            isMapVisible={isMapVisible}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left column - filters */}
          <div className="md:col-span-1 hidden md:block">
            <div className="sticky top-24">
              <FiltersBar 
                onToggleMap={toggleMapView}
                isMapVisible={isMapVisible}
              />
            </div>
          </div>
          
          {/* Right column - spaces and map */}
          <div className="md:col-span-4">
            {/* Mobile toggle button */}
            <div className="md:hidden flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMapView}
                className="flex items-center text-sm"
              >
                {isMapVisible ? "Pokaż Listę" : "Pokaż Mapę"}
              </Button>
            </div>
            
            {/* Desktop - header */}
            <div className="hidden md:block mb-4">
              <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center">
                <h2 className="font-semibold text-lg">
                  Przestrzenie Coworkingowe w Polsce
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMapView}
                  className="flex items-center text-sm"
                >
                  {isMapVisible ? "Ukryj Mapę" : "Pokaż Mapę"}
                </Button>
              </div>
            </div>
            
            {/* Map (when visible) */}
            {isMapVisible && (
              <div className={`w-full ${isMapExpanded ? 'h-[calc(100vh-250px)]' : 'h-[calc(25vh)]'} mb-4 transition-all duration-300`}>
                <MapView 
                  spaces={visibleSpaces}
                  isLoading={isLoading}
                  onBoundsChange={handleBoundsChange}
                  onMarkerClick={handleSpaceSelect} 
                  expanded={isMapExpanded}
                  onToggleExpand={toggleMapExpand}
                />
              </div>
            )}
            
            {/* Spaces list - always shown except on mobile when map is visible */}
            <div className={isMobile && isMapVisible ? 'hidden' : 'block'}>
              <SpacesList onSpaceClick={handleSpaceSelect} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Space Detail Modal */}
      <SpaceDetailModal 
        isOpen={isDetailModalOpen}
        spaceId={selectedSpaceId}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default HomePage;
