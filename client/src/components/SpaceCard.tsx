import { CoworkingSpace } from "@shared/schema";
import { Link } from "wouter";
import StarRating from "@/components/ui/star-rating";
import { MapPin } from "lucide-react";

interface SpaceCardProps {
  space: CoworkingSpace;
  onClick: () => void;
}

const SpaceCard = ({ space, onClick }: SpaceCardProps) => {
  // Helper function to get minimum price from pricing packages
  const getMinPrice = () => {
    if (!space.pricingPackages || space.pricingPackages.length === 0) {
      return null;
    }
    
    const minPrice = Math.min(...space.pricingPackages.map(p => p.price));
    return minPrice;
  };
  
  // Get top three services to display
  const topServices = space.services?.slice(0, 3).map(service => service.name) || [];
  
  return (
    <div 
      className="bg-white rounded-lg shadow-sm overflow-hidden mb-4 hover:shadow-md transition cursor-pointer"
      onClick={onClick}
    >
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          <img 
            className="h-48 w-full object-cover md:w-48" 
            src={space.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'} 
            alt={`${space.name} Coworking Space`} 
          />
        </div>
        <div className="p-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{space.name}</h3>
            <StarRating rating={space.rating} />
          </div>
          <p className="text-sm text-gray-600 mb-2 flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
            {space.city}, {space.address}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {topServices.map((service, index) => (
              <span 
                key={index} 
                className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
              >
                {service}
              </span>
            ))}
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              {getMinPrice() ? (
                <>
                  <div className="text-primary font-semibold">
                    From {getMinPrice()} PLN/month
                  </div>
                  <div className="text-xs text-gray-500">
                    {space.pricingPackages?.length} plan{space.pricingPackages?.length !== 1 ? 's' : ''} available
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-sm">Pricing info unavailable</div>
              )}
            </div>
            <div onClick={e => e.stopPropagation()}>
              <Link href={`/space/${space.id}`} className="text-secondary hover:text-secondary-hover transition">
                Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceCard;
