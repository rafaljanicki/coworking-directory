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
import { useFilters } from "@/hooks/useFilters";
import Footer from "@/components/Footer";
import { Helmet } from 'react-helmet-async';

// Simple debounce hook (copied from MapView)
const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => { return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }; }, []);
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        // console.log("Debounce: Clearing previous timer"); // Optional: too verbose?
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
  return debouncedCallback;
};

const HomePage = () => {
  const isMobile = useIsMobile();
  const { 
    filters, 
    updateFilter,
    resetFilters,
    applyFilters,
    activeFilters
  } = useFilters();
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(true);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  
  const { 
    spaces,
    isLoading, 
    error, 
  } = useSpaces(activeFilters, mapBounds);
  
  const handleSpaceSelect = useCallback((id: number) => {
    setSelectedSpaceId(id);
    setIsDetailModalOpen(true);
  }, []);
  
  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedSpaceId(null);
  };
  
  const toggleMapView = useCallback(() => {
    setIsMapVisible(!isMapVisible);
  }, [isMapVisible]);
  
  const toggleMapExpand = useCallback(() => {
    setIsMapExpanded(!isMapExpanded);
  }, [isMapExpanded]);

  useEffect(() => {
    if (spaces && spaces.length > 0) {
      const uniqueCities = spaces
        .map(space => space.city)
        .filter((city, index, self) => self.indexOf(city) === index);
      setCities(uniqueCities);
    }
  }, [spaces]);
  
  const updateBoundsState = useCallback((bounds: L.LatLngBounds) => {
    setMapBounds(bounds);
  }, []);
  
  const handleBoundsChange = useDebouncedCallback(updateBoundsState, 1000);
  
  const handleSelectSpace = (id: number | null) => {
    setSelectedSpaceId(id);
  };

  return (
    <>
      <Helmet>
         <title>Biura Coworking - Znajdź Przestrzenie Coworkingowe w Polsce</title>
         <meta name="description" content="Przeglądaj i filtruj najlepsze przestrzenie coworkingowe w Polsce. Znajdź idealne biuro dla siebie lub swojego zespołu." />
         {/* Add other relevant meta tags if needed */}
       </Helmet>
      <Header />
      
      <div className="container mx-auto px-4 py-4">
        <div className="md:hidden mb-4">
          <FiltersBar 
            onToggleMap={toggleMapView}
            isMapVisible={isMapVisible}
            filters={filters}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
            applyFilters={applyFilters}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-1 hidden md:block">
            <div className="sticky top-24">
              <FiltersBar 
                onToggleMap={toggleMapView}
                isMapVisible={isMapVisible}
                filters={filters}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                applyFilters={applyFilters}
              />
            </div>
          </div>
          
          <div className="md:col-span-4">
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
            
            {isMapVisible && (
              <div className={`w-full ${isMapExpanded ? 'h-[calc(100vh-250px)]' : 'h-[calc(25vh)]'} mb-4 transition-all duration-300`}>
                <MapView 
                  spaces={spaces}
                  isLoading={isLoading}
                  onBoundsChange={handleBoundsChange}
                  onMarkerClick={handleSpaceSelect} 
                  expanded={isMapExpanded}
                  onToggleExpand={toggleMapExpand}
                />
              </div>
            )}
            
            <div className={isMobile && isMapVisible ? 'hidden' : 'block'}>
              <SpacesList 
                spaces={spaces} 
                isLoading={isLoading} 
                error={error} 
                onSpaceClick={handleSelectSpace}
              />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      
      <SpaceDetailModal 
        isOpen={isDetailModalOpen}
        spaceId={selectedSpaceId}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default HomePage;
