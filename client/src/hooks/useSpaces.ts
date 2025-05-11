import { useQuery } from '@tanstack/react-query';
import { CoworkingSpace } from '@shared/schema';
import { FilterState } from '@/lib/types';
import { API_BASE_URL } from '@/lib/config';
import { apiRequest } from '@/lib/queryClient';
import type L from 'leaflet';

// API response type
interface SpacesApiResponse {
  spaces: CoworkingSpace[];
}

export const useSpaces = (activeFilters: FilterState, mapBounds: L.LatLngBounds | null) => {
  // Build query string for filters
  const getFilterQueryString = () => {
    const filtersToUse = activeFilters;
    const params = new URLSearchParams();
    
    if (filtersToUse.location) {
      params.append('location', filtersToUse.location);
    }
    
    if (filtersToUse.priceMin) {
      params.append('priceMin', filtersToUse.priceMin.toString());
    }
    
    if (filtersToUse.priceMax) {
      params.append('priceMax', filtersToUse.priceMax.toString());
    }
    
    if (filtersToUse.rating) {
      params.append('rating', filtersToUse.rating.toString());
    }
    
    if (filtersToUse.services && filtersToUse.services.length > 0) {
      filtersToUse.services.forEach(service => {
        params.append('services', service);
      });
    }
    
    return params.toString();
  };
  
  // Build query string for bounds
  const getBoundsQueryString = () => {
    const params = new URLSearchParams();
    if (mapBounds) {
      params.append('north', mapBounds.getNorth().toString());
      params.append('south', mapBounds.getSouth().toString());
      params.append('east', mapBounds.getEast().toString());
      params.append('west', mapBounds.getWest().toString());
    }
    return params.toString();
  };
  
  // Fetch spaces using useQuery, dependent on filters and bounds
  // Create a stable query key based on filter *values*
  const queryKeyDeps = [
    'spaces',
    activeFilters.location,
    activeFilters.priceMin,
    activeFilters.priceMax,
    activeFilters.rating,
    JSON.stringify(activeFilters.services.sort()), // Sort services for stability
    mapBounds?.toBBoxString() // Use stable string representation of bounds
  ];

  // Determine if filters are active
  const filtersAreActive = 
    activeFilters.location !== undefined || 
    activeFilters.priceMin !== undefined || 
    activeFilters.priceMax !== undefined || 
    activeFilters.rating !== undefined || 
    activeFilters.services.length > 0;

  const isEnabled = !!mapBounds || filtersAreActive; // Calculate enabled state

  const { 
    data: responseData,
    isLoading, 
    error, 
    refetch
  } = useQuery<SpacesApiResponse, Error>({
    // Use the stable dependency array as the query key
    queryKey: queryKeyDeps, 
    queryFn: async () => { 
      // Use the activeFilters passed as argument here
      // Generate query strings using the passed activeFilters
      const filterQueryString = getFilterQueryString(); 
      const boundsQueryString = getBoundsQueryString();

      // Combine query strings
      const combinedParams = new URLSearchParams();
      filterQueryString.split('&').forEach(p => { if(p) combinedParams.append(p.split('=')[0], p.split('=')[1]); });
      boundsQueryString.split('&').forEach(p => { if(p) combinedParams.append(p.split('=')[0], p.split('=')[1]); });
      const finalQueryString = combinedParams.toString();

      const url = `${API_BASE_URL}/spaces${finalQueryString ? `?${finalQueryString}` : ''}`;
      
      // Use apiRequest - no need to manually set headers or check res.ok
      const res = await apiRequest('GET', url);
      
      return res.json(); // apiRequest returns Response, so call json()
    },
    refetchOnWindowFocus: false, 
    enabled: isEnabled, // Use calculated enabled state
  });

  // Get spaces directly from the response
  const spaces = responseData?.spaces || [];
  
  return { 
    spaces, // Return spaces fetched for current bounds/filters
    // Loading states
    isLoading, 
    error,
    refetch 
  };
};
