import { useState, useEffect, useCallback, useRef } from "react";
import Header from "@/components/Header";
import FiltersBar from "@/components/FiltersBar";
import SpacesList from "@/components/SpacesList";
import MapView from "@/components/MapView";
import SpaceDetailModal from "@/components/SpaceDetailModal";
import { Button } from "@/components/ui/button"; 
import { useIsMobile } from "@/hooks/use-mobile";
import { useSpaces } from "@/hooks/useSpaces";
import type L from 'leaflet';
import { useFilters } from "@/hooks/useFilters";
import Footer from "@/components/Footer";
import { Helmet } from 'react-helmet-async';

// Simple debounce hook
const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => { return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }; }, []);
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
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

const NewHomePageContent = () => (
  <div className="py-8 md:py-12 text-gray-700">
    <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 text-gray-800">
      Znajdź Swoje Idealne Miejsce do Pracy Coworkingowej
    </h1>

    <section className="mb-12 p-6 bg-slate-50 rounded-lg shadow-md">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
        Czym jest biuracoworking.pl?
      </h2>
      <p className="text-gray-600 leading-relaxed">
        Biuracoworking.pl to nowoczesna platforma, która ułatwia wyszukiwanie i rezerwację przestrzeni coworkingowych w całej Polsce. Naszym celem jest połączenie profesjonalistów, freelancerów i firm z najlepszymi biurami coworkingowymi, oferującymi elastyczne warunki pracy i inspirujące środowisko. Dołącz do nas i odkryj nowy wymiar pracy!
      </p>
    </section>

    <section className="mb-12 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-8 text-center">
        Korzyści dla Ciebie
      </h2>
      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="p-6 border border-gray-200 rounded-lg hover:shadow-xl transition-shadow duration-300 bg-white">
          <h3 className="text-xl font-semibold text-primary mb-3">Elastyczność i Oszczędność</h3>
          <p className="text-gray-600 text-sm">Wybieraj spośród setek ofert i płać tylko za to, czego potrzebujesz - od biurka na godziny po dedykowane biura. Bez długoterminowych zobowiązań.</p>
        </div>
        <div className="p-6 border border-gray-200 rounded-lg hover:shadow-xl transition-shadow duration-300 bg-white">
          <h3 className="text-xl font-semibold text-primary mb-3">Inspirująca Społeczność</h3>
          <p className="text-gray-600 text-sm">Dołącz do dynamicznych społeczności, nawiązuj wartościowe kontakty biznesowe i współpracuj z innymi kreatywnymi profesjonalistami.</p>
        </div>
        <div className="p-6 border border-gray-200 rounded-lg hover:shadow-xl transition-shadow duration-300 bg-white">
          <h3 className="text-xl font-semibold text-primary mb-3">Profesjonalne Środowisko</h3>
          <p className="text-gray-600 text-sm">Skorzystaj z w pełni wyposażonych biur, szybkiego internetu, sal konferencyjnych i wsparcia technicznego, aby zwiększyć swoją produktywność.</p>
        </div>
      </div>
    </section>

    <section className="text-center py-10">
      <a
        href="#find-office"
        className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-10 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-focus focus:ring-opacity-50"
      >
        Znajdź Biuro Teraz!
      </a>
    </section>
    <hr className="my-8 border-gray-200" />
  </div>
);


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

  const updateBoundsState = useCallback((bounds: L.LatLngBounds) => {
    setMapBounds(bounds);
  }, []);
  
  const handleBoundsChange = useDebouncedCallback(updateBoundsState, 1000);
  
  return (
    <>
      <Helmet>
         <title>Biura Coworking - Znajdź Idealne Miejsce do Pracy | biuracoworking.pl</title>
         <meta name="description" content="Odkryj najlepsze przestrzenie coworkingowe w Polsce z biuracoworking.pl. Przeglądaj, filtruj i rezerwuj elastyczne biura, biurka i sale konferencyjne. Zacznij już dziś!" />
      </Helmet>
      <Header />
      
      <div className="container mx-auto px-4">
        
        <NewHomePageContent />
        
        <div id="find-office" className="pt-4">

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
                    Dostępne Przestrzenie Coworkingowe
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
                <div className={`w-full ${isMapExpanded ? 'h-[calc(100vh-250px)]' : 'h-[calc(35vh)]'} mb-4 transition-all duration-300`}>
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
                  onSpaceClick={handleSpaceSelect}
                />
              </div>
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
