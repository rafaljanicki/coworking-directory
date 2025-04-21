import { useState } from "react";
import { useSpaces } from "@/hooks/useSpaces";
import SpaceCard from "@/components/SpaceCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface SpacesListProps {
  onSpaceClick: (id: number) => void;
}

const SpacesList = ({ onSpaceClick }: SpacesListProps) => {
  const { spaces, totalSpaces, loading } = useSpaces();
  const [sortMethod, setSortMethod] = useState<string>("recommended");
  
  // Sorted spaces based on selected sort method
  const sortedSpaces = spaces ? [...spaces].sort((a, b) => {
    switch (sortMethod) {
      case "price-low":
        const aMinPrice = Math.min(...(a.pricingPackages?.map(p => p.price) || [Infinity]));
        const bMinPrice = Math.min(...(b.pricingPackages?.map(p => p.price) || [Infinity]));
        return aMinPrice - bMinPrice;
      case "price-high":
        const aMaxPrice = Math.min(...(a.pricingPackages?.map(p => p.price) || [0]));
        const bMaxPrice = Math.min(...(b.pricingPackages?.map(p => p.price) || [0]));
        return bMaxPrice - aMaxPrice;
      case "rating":
        return b.rating - a.rating;
      default:
        // Default "recommended" sorting - uses a mix of rating and price
        return b.rating - a.rating;
    }
  }) : [];
  
  // Skeleton for loading state
  if (loading) {
    return (
      <div className="md:h-[calc(100vh-240px)] md:overflow-y-auto custom-scrollbar pb-20 md:pb-0">
        <div className="flex justify-between items-center mb-4 px-4 md:px-0">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="hidden md:block h-6 w-48" />
        </div>
        
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
            <div className="md:flex">
              <Skeleton className="h-48 w-full md:w-48" />
              <div className="p-4 w-full">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-48 mb-4" />
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="pb-6">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            {totalSpaces} {totalSpaces === 1 ? 'przestrzeń coworkingowa znaleziona' : 
              totalSpaces > 1 && totalSpaces < 5 ? 'przestrzenie coworkingowe znalezione' : 
              'przestrzeni coworkingowych znalezionych'}
          </h2>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Sortuj według:</span>
            <Select
              value={sortMethod}
              onValueChange={setSortMethod}
            >
              <SelectTrigger className="w-[180px] border-0 focus:ring-0 text-sm">
                <SelectValue placeholder="Polecane" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Polecane</SelectItem>
                <SelectItem value="price-low">Cena: od najniższej</SelectItem>
                <SelectItem value="price-high">Cena: od najwyższej</SelectItem>
                <SelectItem value="rating">Ocena</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {sortedSpaces.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">Brak przestrzeni spełniających kryteria.</p>
          <p className="text-gray-500 text-sm mt-2">Spróbuj dostosować kryteria wyszukiwania.</p>
        </div>
      ) : (
        sortedSpaces.map(space => (
          <SpaceCard 
            key={space.id} 
            space={space} 
            onClick={() => onSpaceClick(space.id)}
          />
        ))
      )}
    </div>
  );
};

export default SpacesList;
