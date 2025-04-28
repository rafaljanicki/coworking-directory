import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CoworkingSpace } from '@shared/schema';
import { useFilters } from '@/hooks/useFilters';
import { CompleteSpace, FilterState } from '@/lib/types';
import { API_BASE_URL, API_KEY } from '@/lib/config';
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
  const { 
    data: responseData,
    isLoading, 
    error, 
    refetch
  } = useQuery<SpacesApiResponse, Error>({
    // Query key now includes filters AND bounds (use simple string for bounds to ensure stability)
    queryKey: ['spaces', activeFilters, mapBounds?.toBBoxString()], 
    queryFn: async () => { 
      console.log('>>> queryFn running with filters:', JSON.stringify(activeFilters), 'Bounds:', mapBounds?.toBBoxString());

      // Generate query strings
      const filterQueryString = getFilterQueryString();
      const boundsQueryString = getBoundsQueryString();

      console.log('>>> filterQueryString generated:', filterQueryString);
      console.log('>>> boundsQueryString generated:', boundsQueryString);

      // Combine query strings
      const combinedParams = new URLSearchParams();
      filterQueryString.split('&').forEach(p => { if(p) combinedParams.append(p.split('=')[0], p.split('=')[1]); });
      boundsQueryString.split('&').forEach(p => { if(p) combinedParams.append(p.split('=')[0], p.split('=')[1]); });
      const finalQueryString = combinedParams.toString();

      const url = `${API_BASE_URL}/spaces${finalQueryString ? `?${finalQueryString}` : ''}`;
      
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
    refetchOnWindowFocus: false, 
    enabled: !!mapBounds, // Only run query when mapBounds are available
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
