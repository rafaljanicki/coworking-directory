import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CoworkingSpace } from '@shared/schema';
import { useFilters } from '@/hooks/useFilters';
import { CompleteSpace } from '@/lib/types';
import { API_BASE_URL, API_KEY } from '@/lib/config';

export const useSpaces = () => {
  const { activeFilters } = useFilters();
  const [spaces, setSpaces] = useState<CoworkingSpace[]>([]);
  const [totalSpaces, setTotalSpaces] = useState(0);
  const [visibleSpaces, setVisibleSpaces] = useState<CoworkingSpace[]>([]);
  const [mapBounds, setMapBounds] = useState<any>(null);
  
  // Build query string from filters
  const getQueryString = () => {
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
  
  // Fetch the spaces based on filters
  const { data, isLoading, error } = useQuery({
    queryKey: ['spaces', activeFilters],
    queryFn: async () => {
      const queryString = getQueryString();
      const url = `${API_BASE_URL}/spaces${queryString ? `?${queryString}` : ''}`;
      
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
    // Disable automatic refetching based on window focus
    refetchOnWindowFocus: false,
  });
  
  // Update spaces when data changes
  useEffect(() => {
    if (data) {
      console.log("API response:", data);
      if (Array.isArray(data)) {
        setSpaces(data);
        setTotalSpaces(data.length);
      } else if (data.spaces) {
        setSpaces(data.spaces);
        setTotalSpaces(data.total || data.spaces.length);
      } else {
        console.error("Unexpected API response format:", data);
        setSpaces([]);
        setTotalSpaces(0);
      }
    }
  }, [data]);
  
  // Filter spaces based on map bounds
  useEffect(() => {
    if (!mapBounds || !spaces.length) {
      setVisibleSpaces(spaces);
      return;
    }
    
    const visible = spaces.filter(space => {
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
  }, [spaces, mapBounds]);
  
  // Update map bounds when they change
  const updateMapBounds = useCallback((bounds: any) => {
    setMapBounds(bounds);
  }, []);
  
  // Get a specific space by ID
  const getSpaceById = useCallback((id: number): CompleteSpace | null => {
    const space = spaces.find(s => s.id === id);
    return space ? space as CompleteSpace : null;
  }, [spaces]);
  
  return { 
    spaces, 
    visibleSpaces,
    totalSpaces, 
    loading: isLoading, 
    error,
    getSpaceById,
    updateMapBounds
  };
};
