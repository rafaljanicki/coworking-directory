import { useSpaces } from "@/hooks/useSpaces";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/ui/star-rating";
import { Flag, MapPin, Check, X } from "lucide-react";
import { CompleteSpace } from "@/lib/types";
import { CompleteSpace as CompleteSpaceType } from "@/lib/types";
import ReportChangesModal from "@/components/ReportChangesModal";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

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
  const { getSpaceById } = useSpaces();
  const [space, setSpace] = useState<CompleteSpaceType | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  useEffect(() => {
    if (isOpen && spaceId) {
      const fetchedSpace = getSpaceById(spaceId);
      if (fetchedSpace) {
        setSpace(fetchedSpace as CompleteSpaceType);
      }
    } else {
      setSpace(null);
    }
  }, [isOpen, spaceId, getSpaceById]);
  
  if (!space) {
    return null;
  }
  
  // Mock images for gallery (in a real app, these would come from the backend)
  const galleryImages = [
    space.imageUrl || 'https://via.placeholder.com/800x600?text=No+Image',
    'https://via.placeholder.com/800x600?text=Meeting+Room',
    'https://via.placeholder.com/800x600?text=Lounge+Area',
    'https://via.placeholder.com/800x600?text=Desk+Area',
    'https://via.placeholder.com/800x600?text=Coffee+Corner'
  ];
  
  // Group amenities into columns
  const amenities = space.services?.map(service => service.name) || [];
  const amenitiesFirstColumn = amenities.slice(0, Math.ceil(amenities.length / 2));
  const amenitiesSecondColumn = amenities.slice(Math.ceil(amenities.length / 2));
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent style={{zIndex: 9999}} className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{space.name}</h2>
                <p className="text-gray-600">{space.city}, {space.address}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Image Gallery */}
            <div className="mb-6">
              <div className="grid grid-cols-4 gap-2 h-72">
                <div className="col-span-2 row-span-2">
                  <img 
                    src={galleryImages[selectedImageIndex]} 
                    alt={`${space.name} main view`} 
                    className="w-full h-full object-cover rounded-lg" 
                  />
                </div>
                {galleryImages.slice(0, 4).map((img, i) => (
                  i !== selectedImageIndex && (
                    <div key={i} onClick={() => setSelectedImageIndex(i)}>
                      <img 
                        src={img} 
                        alt={`${space.name} view ${i+1}`} 
                        className="w-full h-full object-cover rounded-lg cursor-pointer" 
                      />
                    </div>
                  )
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Details Column */}
              <div className="md:col-span-2">
                <div className="flex items-center mb-4">
                  <div className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full flex items-center mr-3">
                    <StarRating rating={space.rating} size="sm" />
                  </div>
                  <span className="text-gray-600">({Math.floor(Math.random() * 100) + 50} reviews from Google)</span>
                </div>
                
                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">About this space</h3>
                  <p className="text-gray-700 mb-3">
                    {space.description || `${space.name} is a premier coworking space designed for creativity and collaboration. With ergonomic furniture, abundant natural light, and a vibrant community of professionals, it's the perfect environment for productive work.`}
                  </p>
                  <p className="text-gray-700 mb-3">
                    The space features multiple areas for different work styles - focused work zones, collaborative spaces, and casual meeting spots. Regular community events help you connect with like-minded professionals.
                  </p>
                </div>
                
                {/* Amenities */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Amenities & Services</h3>
                  <div className="grid grid-cols-2 gap-y-2">
                    {amenitiesFirstColumn.map((amenity, i) => (
                      <div key={i} className="flex items-center">
                        <Check className="h-4 w-4 text-secondary mr-2" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                    {amenitiesSecondColumn.map((amenity, i) => (
                      <div key={i} className="flex items-center">
                        <Check className="h-4 w-4 text-secondary mr-2" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Location Map */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Location</h3>
                  <div className="h-48 bg-gray-200 rounded-lg mb-2 relative overflow-hidden">
                    <MapContainer 
                      center={[parseFloat(space.latitude), parseFloat(space.longitude)]} 
                      zoom={15} 
                      className="h-full w-full"
                      zoomControl={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[parseFloat(space.latitude), parseFloat(space.longitude)]}>
                        <Popup>
                          <div className="text-center py-1">
                            <strong>{space.name}</strong><br />
                            {space.address}
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                  
                  <p className="text-gray-700">
                    {space.locationDescription || `Located in ${space.city}, easily accessible by public transportation. Nearby amenities include restaurants, cafes, and shopping areas.`}
                  </p>
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
                  
                  {space.pricingPackages?.length ? (
                    space.pricingPackages.map((pkg, index) => {
                      const isPopular = index === 1; // Mark second package as popular
                      
                      return (
                        <div 
                          key={pkg.id} 
                          className={`bg-white rounded-lg border ${isPopular ? 'border-primary' : 'border-gray-200'} p-4 mb-3 hover:border-primary transition cursor-pointer ${isPopular ? 'shadow-sm' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{pkg.name}</h4>
                              {isPopular && (
                                <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                                  Popular
                                </span>
                              )}
                            </div>
                            <div className="text-primary font-semibold">
                              {pkg.price} PLN/{pkg.billingPeriod}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {pkg.features?.map((feature, i) => (
                              <li key={i} className="flex items-start">
                                <Check className="text-green-500 h-4 w-4 mt-0.5 mr-2" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
                      <p className="text-gray-500 text-center">No pricing information available</p>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <Button className="bg-primary text-white w-full py-3 rounded-lg font-medium hover:bg-primary/90">
                      Contact Space
                    </Button>
                    <div className="text-center text-sm text-gray-500 mt-2">
                      or call {space.phone || "+48 000 000 000"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <ReportChangesModal 
        isOpen={reportModalOpen}
        spaceId={spaceId}
        onClose={() => setReportModalOpen(false)}
        spaceName={space.name}
      />
    </>
  );
};

export default SpaceDetailModal;
