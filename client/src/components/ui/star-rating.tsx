import { FC } from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const StarRating: FC<StarRatingProps> = ({ 
  rating, 
  maxRating = 5, 
  size = "md",
  className
}) => {
  // Calculate full stars, half stars, and empty stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.4 && rating - fullStars < 0.9;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  // Determine star size based on the size prop
  const starSize = {
    sm: 14,
    md: 18,
    lg: 24
  }[size];

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }[size];

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star 
            key={`full-${i}`} 
            size={starSize} 
            className="text-red-500 fill-red-500"
          />
        ))}
        
        {/* Half star if needed */}
        {hasHalfStar && (
          <StarHalf 
            size={starSize} 
            className="text-red-500 fill-red-500"
          />
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star 
            key={`empty-${i}`} 
            size={starSize} 
            className="text-gray-300" 
          />
        ))}
      </div>
      
      <span className={cn("ml-1 font-medium text-accent", textSize)}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

export default StarRating;
