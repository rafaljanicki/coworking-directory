import { useState, useEffect, useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { CoworkingSpace } from '@shared/schema';
import { useFilters } from '@/hooks/useFilters';
import { CompleteSpace } from '@/lib/types';
import { API_BASE_URL, API_KEY } from '@/lib/config';

const PAGE_LIMIT = 10;

interface SpacesApiResponse {
  spaces: CoworkingSpace[];
  lastKey?: any; // Use any for simplicity if DynamoDB types aren't shared/installed on frontend
}

export const useSpaces = () => {
  const { activeFilters } = useFilters();
  const [visibleSpaces, setVisibleSpaces] = useState<CoworkingSpace[]>([]);
  const [mapBounds, setMapBounds] = useState<any>(null);
  
  // Build query string from filters (excluding pagination)
  const getFilterQueryString = () => {
    const params = new URLSearchParams();
    
    if (activeFilters.location) {
      params.append('location', activeFilters.location);
    }
    
    if (activeFilters.priceMin) {
      params.append('priceMin', activeFilters.priceMin.toString());
    }
    
    if (activeFilters.priceMax) {
      params.append('priceMax', activeFilters.priceMax.toString());
    }
    
    if (activeFilters.rating) {
      params.append('rating', activeFilters.rating.toString());
    }
    
    if (activeFilters.services && activeFilters.services.length > 0) {
      activeFilters.services.forEach(service => {
        params.append('services', service);
      });
    }
    
    return params.toString();
  };
  
  // Fetch spaces using infinite query for pagination
  const { 
    data, 
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteQuery<SpacesApiResponse, Error>({
    queryKey: ['spaces', activeFilters], // Query key includes filters
    queryFn: async ({ pageParam = undefined }) => {
      const filterQueryString = getFilterQueryString();
      const paginationParams = new URLSearchParams();
      paginationParams.append('limit', PAGE_LIMIT.toString());
      if (pageParam) {
        paginationParams.append('lastKey', JSON.stringify(pageParam));
      }
      
      const queryString = `${filterQueryString ? `&${filterQueryString}` : ''}`;
      const url = `${API_BASE_URL}/spaces?${paginationParams.toString()}${queryString}`;
      
      // Include API key header if provided
      const headers: Record<string, string> = {};
      if (API_KEY) {
        headers['x-api-key'] = API_KEY;
      }
      
      console.log("Fetching from URL:", url);
      const res = await fetch(url, { headers });
      
      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }
      
      return res.json();
    },
    initialPageParam: undefined, // Start with no lastKey
    getNextPageParam: (lastPage) => {
      // Return the lastKey from the last fetched page to use as pageParam for the next fetch
      return lastPage.lastKey;
    },
    refetchOnWindowFocus: false, // Optional: keep disabled
  });
  
  // Memoize the flattened list of spaces to prevent unnecessary reference changes
  const allSpaces = useMemo(() => {
    return data?.pages.flatMap(page => page.spaces) || [];
  }, [data?.pages]);
  
  // Filter spaces based on map bounds
  useEffect(() => {
    if (!mapBounds || !allSpaces.length) {
      setVisibleSpaces(allSpaces);
      return;
    }
    
    const visible = allSpaces.filter(space => {
      // Skip spaces without valid coordinates
      if (!space.latitude || !space.longitude) return false;
      
      const lat = typeof space.latitude === 'string' ? parseFloat(space.latitude) : space.latitude;
      const lng = typeof space.longitude === 'string' ? parseFloat(space.longitude) : space.longitude;
      
      return (
        lat >= mapBounds.getSouth() && 
        lat <= mapBounds.getNorth() && 
        lng >= mapBounds.getWest() && 
        lng <= mapBounds.getEast()
      );
    });
    
    setVisibleSpaces(visible);
  }, [allSpaces, mapBounds]);
  
  // Update map bounds when they change
  const updateMapBounds = useCallback((bounds: any) => {
    setMapBounds(bounds);
  }, []);
  
  // Get a specific space by ID
  const getSpaceById = useCallback((id: number): CompleteSpace | null => {
    const space = allSpaces.find(s => s.id === id);
    return space ? space as CompleteSpace : null;
  }, [allSpaces]);
  
  return { 
    // Return all fetched spaces and the visible subset
    allSpaces, 
    visibleSpaces,
    // Loading states
    isLoading, // Initial load 
    isFetchingNextPage, // Loading next page
    error,
    // Pagination controls
    fetchNextPage,
    hasNextPage, 
    // Map and detail view functions
    getSpaceById,
    updateMapBounds
  };
};
