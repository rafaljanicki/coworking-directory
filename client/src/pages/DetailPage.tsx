import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import Header from "@/components/Header";
import { useSpaces } from "@/hooks/useSpaces";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/ui/star-rating";
import { CheckCircle, Flag, MapPin, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { CompleteSpace } from "@/lib/types";
import ReportChangesModal from "@/components/ReportChangesModal";
import { Skeleton } from "@/components/ui/skeleton";
import { SpacePageSEO } from "@/components/SEO";

const DetailPage = () => {
  const [_, params] = useRoute<{ id: string }>("/space/:id");
  const spaceId = params?.id ? parseInt(params.id) : null;
  const { getSpaceById, loading } = useSpaces();
  const [space, setSpace] = useState<CompleteSpace | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  useEffect(() => {
    if (spaceId) {
      const fetchedSpace = getSpaceById(spaceId);
      if (fetchedSpace) {
        setSpace(fetchedSpace as CompleteSpace);
      }
    }
  }, [spaceId, getSpaceById]);
  
  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Link href="/">
            <a className="inline-flex items-center text-secondary hover:text-secondary-hover mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to all spaces
            </a>
          </Link>
          
          <div className="space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-6 w-1/4" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-80 w-full rounded-lg" />
                
                <div className="flex gap-2">
                  <Skeleton className="h-20 w-20 rounded-lg" />
                  <Skeleton className="h-20 w-20 rounded-lg" />
                  <Skeleton className="h-20 w-20 rounded-lg" />
                  <Skeleton className="h-20 w-20 rounded-lg" />
                </div>
                
                <div className="space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              
              <div>
                <Skeleton className="h-80 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  if (!space) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <Link href="/">
            <a className="inline-flex items-center text-secondary hover:text-secondary-hover mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to all spaces
            </a>
          </Link>
          
          <h1 className="text-2xl font-bold mb-4">Space Not Found</h1>
          <p className="text-gray-600 mb-6">The coworking space you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/">
              <a>Browse All Spaces</a>
            </Link>
          </Button>
        </div>
      </>
    );
  }
  
  // Mock images for gallery (in a real app, these would come from the backend)
  const galleryImages = [
    space.imageUrl || 'https://via.placeholder.com/800x600?text=No+Image',
    'https://via.placeholder.com/800x600?text=Meeting+Room',
    'https://via.placeholder.com/800x600?text=Lounge+Area',
    'https://via.placeholder.com/800x600?text=Desk+Area',
    'https://via.placeholder.com/800x600?text=Coffee+Corner'
  ];
  
  return (
    <>
      {space && <SpacePageSEO space={space} />}
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <a className="inline-flex items-center text-secondary hover:text-secondary-hover mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to all spaces
          </a>
        </Link>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{space.name}</h1>
          <div className="flex items-center mt-2">
            <MapPin className="h-4 w-4 text-gray-500 mr-1" />
            <span className="text-gray-600">{space.city}, {space.address}</span>
            
            <div className="ml-6 flex items-center">
              <StarRating rating={space.rating} />
              <span className="ml-2 text-gray-600">({Math.floor(Math.random() * 100) + 50} reviews)</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="rounded-lg overflow-hidden mb-4 max-h-[500px]">
              <img 
                src={galleryImages[selectedImageIndex]} 
                alt={space.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Image Gallery Thumbnails */}
            <div className="grid grid-cols-5 gap-2 mb-8">
              {galleryImages.map((image, index) => (
                <div 
                  key={index}
                  className={`rounded-lg overflow-hidden cursor-pointer ${selectedImageIndex === index ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img 
                    src={image} 
                    alt={`${space.name} view ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </div>
              ))}
            </div>
            
            {/* About Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">About this space</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4">
                  {space.description || `${space.name} is a premier coworking space designed for creativity and collaboration. With ergonomic furniture, abundant natural light, and a vibrant community of professionals, it's the perfect environment for productive work.`}
                </p>
                <p className="text-gray-700">
                  The space features multiple areas for different work styles - focused work zones, collaborative spaces, and casual meeting spots. Regular community events help you connect with like-minded professionals.
                </p>
              </div>
            </div>
            
            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Amenities & Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {space.services?.map((service, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{service.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Location */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Location</h2>
              <div className="bg-gray-100 h-64 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-gray-600">{space.city}, {space.address}</p>
                </div>
              </div>
              <p className="text-gray-700">
                {space.locationDescription || `Located in ${space.city}, easily accessible by public transportation. Nearby amenities include restaurants, cafes, and shopping areas.`}
              </p>
            </div>
            
            {/* Report Changes */}
            <div className="border-t border-gray-200 pt-6">
              <Button 
                variant="outline" 
                className="text-secondary"
                onClick={() => setReportModalOpen(true)}
              >
                <Flag className="h-4 w-4 mr-2" />
                Report information changes
              </Button>
            </div>
          </div>
          
          {/* Pricing Column */}
          <div>
            <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Pricing Packages</h2>
              
              {space.pricingPackages?.length ? (
                space.pricingPackages.map((pkg, index) => {
                  const isPopular = index === 1; // Mark second package as popular
                  
                  return (
                    <div 
                      key={pkg.id} 
                      className={`bg-white rounded-lg border ${isPopular ? 'border-primary' : 'border-gray-200'} p-4 mb-4 hover:border-primary transition cursor-pointer ${isPopular ? 'shadow-sm' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{pkg.name}</h3>
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
                            <CheckCircle className="text-green-500 h-4 w-4 mt-0.5 mr-2" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                  <p className="text-gray-500 text-center">No pricing information available</p>
                </div>
              )}
              
              <Button className="w-full bg-primary text-white hover:bg-primary/90 mt-4">
                Contact Space
              </Button>
              <div className="text-center text-sm text-gray-500 mt-3">
                or call {space.phone || "+48 000 000 000"}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ReportChangesModal 
        isOpen={reportModalOpen}
        spaceId={space.id}
        onClose={() => setReportModalOpen(false)}
        spaceName={space.name}
      />
    </>
  );
};

export default DetailPage;
