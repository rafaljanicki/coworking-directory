import { useState } from "react";
import Header from "@/components/Header";
import FiltersBar from "@/components/FiltersBar";
import SpacesList from "@/components/SpacesList";
import MapView from "@/components/MapView";
import SpaceDetailModal from "@/components/SpaceDetailModal";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const HomePage = () => {
  const isMobile = useIsMobile();
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(!isMobile);
  
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
  
  return (
    <>
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
                {isMapVisible ? "Show List" : "Show Map"}
              </Button>
            </div>
            
            {/* Desktop - header */}
            <div className="hidden md:block mb-4">
              <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center">
                <h2 className="font-semibold text-lg">
                  Coworking Spaces in Poland
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMapView}
                  className="flex items-center text-sm"
                >
                  {isMapVisible ? "Hide Map" : "Show Map"}
                </Button>
              </div>
            </div>
            
            {/* Map (when visible) */}
            {isMapVisible && (
              <div className="w-full h-[calc(100vh-250px)] mb-4">
                <MapView onMarkerClick={handleSpaceSelect} />
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
