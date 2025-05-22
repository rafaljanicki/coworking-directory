// Force re-deploy 2025-05-16
import { CoworkingSpace } from "@shared/schema";
import { Link } from "wouter";
import StarRating from "@/components/ui/star-rating";
import { MapPin } from "lucide-react";

interface SpaceCardProps {
  space: CoworkingSpace;
  onClick: () => void;
}

const getDisplayImageUrl = (imageUrl: string | undefined | null): string => {
  const placeholderSoon = '/img/office-placeholder-soon.png'; // For listings where image is coming soon
  const defaultFallback = '/img/logo-placeholder-fallback.png'; // Fallback if imageUrl is null/empty, can be same as placeholderSoon or a generic no-image

  if (imageUrl && imageUrl.includes('via.placeholder.com')) {
    return placeholderSoon;
  }
  if (imageUrl) {
    return imageUrl;
  }
  return defaultFallback; 
};

const SpaceCard = ({ space, onClick }: SpaceCardProps) => {
  // Helper function to get minimum price from pricing packages
  const getMinPrice = () => {
    if (!space.pricingPackages || space.pricingPackages.length === 0) {
      return null;
    }
    
    const minPrice = Math.min(...space.pricingPackages.map(p => p.price));
    return minPrice;
  };
  
  const displayImageUrl = getDisplayImageUrl(space.imageUrl);
  const imageAltText = (space.imageUrl && !space.imageUrl.includes('via.placeholder.com') && displayImageUrl !== '/img/office-placeholder-soon.png' && displayImageUrl !== '/img/logo-placeholder-fallback.png')
    ? `${space.name} Przestrzeń Coworkingowa`
    : `${space.name} - zdjęcie wkrótce`;

  return (
    <article 
      className="bg-white rounded-lg shadow-sm overflow-hidden mb-4 hover:shadow-md transition cursor-pointer"
      onClick={onClick}
      itemScope
      itemType="https://schema.org/LocalBusiness"
    >
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          <img 
            className="h-48 w-full object-cover md:w-48" 
            src={displayImageUrl} 
            alt={imageAltText} 
            itemProp="image"
          />
        </div>
        <div className="p-4 flex-1">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900" itemProp="name">{space.name}</h2>
            <div itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
              <meta itemProp="ratingValue" content={space.rating?.toString() ?? '0'} />
              <meta itemProp="reviewCount" content={Math.floor(Math.random() * 100 + 10).toString()} /> 
              <StarRating rating={space.rating ?? 0} />
            </div>
          </header>
          <address className="text-sm text-gray-600 mb-2 flex items-center not-italic" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
            <span itemProp="addressLocality">{space.city}</span>, <span itemProp="streetAddress">{space.address}</span>
          </address>
          
          <footer className="flex justify-between items-end">
            <div>
              {getMinPrice() ? (
                <>
                  <div className="text-primary font-semibold" itemProp="priceRange">
                    Od {getMinPrice()} PLN/miesiąc
                  </div>
                  <div className="text-xs text-gray-500">
                    {space.pricingPackages?.length} plan{space.pricingPackages?.length !== 1 ? 'ów' : ''} dostępnych
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-sm">Informacje o cenach niedostępne</div>
              )}
            </div>
            <div onClick={e => e.stopPropagation()}>
              <Link href={`/space/${space.id}`} className="text-secondary hover:text-secondary-hover transition">
                Szczegóły
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </article>
  );
};

export default SpaceCard;
