import { useState, useEffect } from "react";
import Header from "@/components/Header";
import FiltersBar from "@/components/FiltersBar";
import SpacesList from "@/components/SpacesList";
import MapView from "@/components/MapView";
import SpaceDetailModal from "@/components/SpaceDetailModal";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { HomePageSEO } from "@/components/SEO";
import { useSpaces } from "@/hooks/useSpaces";

const HomePage = () => {
  const isMobile = useIsMobile();
  const { spaces } = useSpaces();
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(!isMobile);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  
  const handleSpaceSelect = (id: number) => {
    setSelectedSpaceId(id);
    setIsDetailModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedSpaceId(null);
  };
  
  const toggleMapView = () => {
    setIsMapVisible(!isMapVisible);
  };
  
  const toggleMapExpand = () => {
    setIsMapExpanded(!isMapExpanded);
  };

  // Extract unique cities for SEO
  useEffect(() => {
    if (spaces && spaces.length > 0) {
      const uniqueCities = [...new Set(spaces.map(space => space.city))];
      setCities(uniqueCities);
    }
  }, [spaces]);
  
  return (
    <>
      <HomePageSEO spaces={spaces?.length || 0} cities={cities} />
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
