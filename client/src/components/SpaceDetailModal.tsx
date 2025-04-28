import { useSpaces } from "@/hooks/useSpaces";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/ui/star-rating";
import { Flag, MapPin, Check, X, Loader2 } from "lucide-react";
import { CompleteSpace as CompleteSpaceType } from "@/lib/types";
import ReportChangesModal from "@/components/ReportChangesModal";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { API_BASE_URL, API_KEY } from '@/lib/config';

// Define the fetcher function
const fetchSpaceById = async (spaceId: number): Promise<CompleteSpaceType> => {
  const url = `${API_BASE_URL}/spaces/${spaceId}`;
  const headers: Record<string, string> = {};
  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }
  
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const errorData = await response.text();
    console.error(`Fetch error for space ${spaceId} from ${url}:`, response.status, errorData);
    throw new Error(`Failed to fetch space ${spaceId}: ${response.statusText}`);
  }
  try {
    return await response.json();
  } catch (e) {
    console.error(`Failed to parse JSON response for space ${spaceId} from ${url}:`, e);
    throw new Error(`Invalid response received for space ${spaceId}`);
  }
};

interface SpaceDetailModalProps {
  isOpen: boolean;
  spaceId: number | null;
  onClose: () => void;
}

const SpaceDetailModal = ({ 
  isOpen, 
  spaceId, 
  onClose 
}: SpaceDetailModalProps) => {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { 
    data: space, 
    isLoading, 
    isError, 
    error 
  } = useQuery<CompleteSpaceType, Error>({
    queryKey: ['space', spaceId], 
    queryFn: () => fetchSpaceById(spaceId!), 
    enabled: isOpen && !!spaceId, 
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false, 
  });
  
  useEffect(() => {
    if (!isOpen || !space) {
      setSelectedImageIndex(0);
    }
  }, [isOpen, space]);

  const handleClose = () => {
    onClose();
  };
  
  // --- Prepare data used in the main render block --- 
  // Move data preparation here to avoid repetition in conditional rendering
  const spaceData = space; // Alias for clarity inside the return
  const galleryImages = spaceData ? [
    spaceData.imageUrl || 'https://via.placeholder.com/800x600?text=No+Image',
    'https://via.placeholder.com/800x600?text=Meeting+Room',
    'https://via.placeholder.com/800x600?text=Lounge+Area',
    'https://via.placeholder.com/800x600?text=Desk+Area',
    'https://via.placeholder.com/800x600?text=Coffee+Corner'
  ] : [];
  
  const amenities = spaceData?.services?.map(service => service.name) || [];
  const amenitiesFirstColumn = amenities.slice(0, Math.ceil(amenities.length / 2));
  const amenitiesSecondColumn = amenities.slice(Math.ceil(amenities.length / 2));

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent 
           style={{zIndex: 9999}} 
           className="max-w-4xl w-full max-h-[90vh] flex flex-col p-0"
        >
          {/* Moved conditional rendering directly inside DialogContent */} 
          <div className="overflow-y-auto flex-grow">
            {isLoading && (
              <div className="flex justify-center items-center h-[70vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            )}

            {isError && !isLoading && (
              <div className="flex flex-col justify-center items-center h-[70vh] text-center p-6">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Space</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't fetch the details for this space. Please try again later.
                </p>
                <pre className="text-xs text-gray-500 bg-gray-100 p-2 rounded max-w-full overflow-x-auto">
                  {error?.message || 'Unknown error'}
                </pre>
              </div>
            )}
            
            {!isLoading && !isError && !spaceData && (
               <div className="flex justify-center items-center h-[70vh]">
                 <p className="text-gray-500">No space selected or data unavailable.</p>
               </div>
            )}

            {/* --- Render content only if data is successfully loaded --- */} 
            {spaceData && !isLoading && !isError && (
              <div className="p-6">
                {/* Top Header */} 
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{spaceData.name}</h2>
                    <p className="text-gray-600">{spaceData.city}, {spaceData.address}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Image Gallery */} 
                <div className="mb-6">
                   <div className="grid grid-cols-4 gap-2 h-72">
                     <div className="col-span-2 row-span-2">
                       <img 
                         src={galleryImages[selectedImageIndex]} 
                         alt={`${spaceData.name} main view`} 
                         className="w-full h-full object-cover rounded-lg bg-gray-200" 
                       />
                     </div>
                     {galleryImages.slice(1, 4).map((img, i) => (
                       <button 
                         key={img + i} 
                         onClick={() => setSelectedImageIndex(i + 1)} 
                         className={`focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg ${(i + 1) === selectedImageIndex ? 'opacity-50 cursor-default' : ''}`}
                         disabled={(i + 1) === selectedImageIndex}
                         aria-label={`View image ${i + 2}`}
                       >
                         <img 
                           src={img} 
                           alt={`${spaceData.name} view ${i + 2}`} 
                           className="w-full h-full object-cover rounded-lg bg-gray-200" 
                         />
                       </button>
                     ))}
                     {Array.from({ length: Math.max(0, 3 - galleryImages.slice(1).length) }).map((_, i) => (
                      <div key={`placeholder-${i}`} className="bg-gray-200 rounded-lg"></div>
                     ))}
                   </div>
                 </div>
                
                {/* Main Content Grid */} 
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Details Column */} 
                  <div className="md:col-span-2">
                    {/* Rating */} 
                    <div className="flex items-center mb-4">
                      <div className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full flex items-center mr-3">
                        <StarRating rating={spaceData.rating} size="sm" />
                      </div>
                    </div>
                    
                    {/* Description */} 
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">About this space</h3>
                      <p className="text-gray-700 mb-3">
                        {spaceData.description || `Welcome to ${spaceData.name}, a vibrant coworking space in ${spaceData.city}.`}
                      </p>
                    </div>
                    
                    {/* Amenities */} 
                    {amenities.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Amenities & Services</h3>
                        <div className="grid grid-cols-2 gap-y-2">
                          {amenitiesFirstColumn.map((amenity, i) => (
                            <div key={i} className="flex items-center">
                              <Check className="h-4 w-4 text-secondary mr-2 flex-shrink-0" />
                              <span>{amenity}</span>
                            </div>
                          ))}
                          {amenitiesSecondColumn.map((amenity, i) => (
                            <div key={i} className="flex items-center">
                              <Check className="h-4 w-4 text-secondary mr-2 flex-shrink-0" />
                              <span>{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Location Map */} 
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Location</h3>
                      {typeof spaceData.latitude === 'number' && typeof spaceData.longitude === 'number' ? (
                        <>
                          <div className="h-48 bg-gray-200 rounded-lg mb-2 relative overflow-hidden">
                            <MapContainer 
                              center={[spaceData.latitude, spaceData.longitude]} 
                              zoom={15} 
                              className="h-full w-full"
                              zoomControl={false}
                              scrollWheelZoom={false}
                            >
                              <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              <Marker position={[spaceData.latitude, spaceData.longitude]}>
                                <Popup>
                                  <div className="text-center py-1">
                                    <strong>{spaceData.name}</strong><br />
                                    {spaceData.address}
                                  </div>
                                </Popup>
                              </Marker>
                            </MapContainer>
                          </div>
                          <p className="text-gray-700">
                            {spaceData.locationDescription || `Located in ${spaceData.city}, easily accessible.`}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-500">Map location not available.</p>
                      )}
                    </div>
                    
                    {/* Report Changes Link */} 
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <Button 
                        variant="ghost" 
                        className="text-secondary hover:text-secondary-hover pl-0"
                        onClick={() => {
                          setReportModalOpen(true);
                        }}
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        Report information changes
                      </Button>
                    </div>
                  </div>
                  
                  {/* Pricing Column */} 
                  <div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 sticky top-4">
                      <h3 className="text-lg font-semibold mb-3">Pricing Packages</h3>
                      
                      {spaceData.pricingPackages && spaceData.pricingPackages.length > 0 ? (
                        spaceData.pricingPackages.map((pkg) => {
                          return (
                            <div 
                              key={pkg.id || pkg.name} 
                              className={`bg-white rounded-lg border border-gray-200 p-4 mb-3 hover:border-primary transition cursor-pointer`}
                            >
                              <div className="flex justify-between items-start mb-2 gap-2">
                                <div className="flex-grow">
                                  <h4 className="font-medium text-gray-900">{pkg.name}</h4>
                                </div>
                                <div className="text-primary font-semibold whitespace-nowrap flex-shrink-0">
                                  {typeof pkg.price === 'number' ? `${pkg.price} PLN` : 'Inquire'} 
                                  {pkg.billingPeriod && <span className="text-sm text-gray-500">/{pkg.billingPeriod}</span>}
                                </div>
                              </div>
                              {pkg.description && <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>}
                              {pkg.features && pkg.features.length > 0 && (
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {pkg.features.map((feature, i) => (
                                    <li key={i} className="flex items-start">
                                      <Check className="text-green-500 h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
                          <p className="text-gray-500 text-center">No specific pricing packages available. Contact for details.</p>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <Button className="bg-primary text-white w-full py-3 rounded-lg font-medium hover:bg-primary/90">
                          Contact Space
                        </Button>
                        {spaceData.phone && (
                          <div className="text-center text-sm text-gray-500 mt-2">
                            or call {spaceData.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Render Report Modal only if space data is available */} 
      {spaceData && (
        <ReportChangesModal 
          isOpen={reportModalOpen}
          spaceId={spaceId}
          onClose={() => setReportModalOpen(false)}
          spaceName={spaceData.name}
        />
      )}
    </>
  );
};

export default SpaceDetailModal;
