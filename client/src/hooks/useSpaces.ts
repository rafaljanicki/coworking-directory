import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CoworkingSpace } from '@shared/schema';
import { useFilters } from '@/hooks/useFilters';
import { CompleteSpace } from '@/lib/types';
import { API_BASE_URL } from '@/lib/config';

export const useSpaces = () => {
  const { activeFilters } = useFilters();
  const [spaces, setSpaces] = useState<CoworkingSpace[]>([]);
  const [totalSpaces, setTotalSpaces] = useState(0);
  
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
    
    if (activeFilters.services.length > 0) {
      activeFilters.services.forEach(service => {
        params.append('services', service);
      });
    }
    
    return params.toString();
  };
  
  // Fetch the spaces based on filters
  const endpoint = `${API_BASE_URL}/spaces`;
  const { data, isLoading, error } = useQuery({
    queryKey: [endpoint, activeFilters],
    queryFn: async () => {
      const queryString = getQueryString();
      const url = `${endpoint}${queryString ? `?${queryString}` : ''}`;
      return fetch(url).then(res => res.json());
    },
  });
  
  // Update spaces when data changes
  useEffect(() => {
    if (data) {
      setSpaces(data.spaces);
      setTotalSpaces(data.total);
    }
  }, [data]);
  
  // Get a specific space by ID
  const getSpaceById = useCallback((id: number): CompleteSpace | null => {
    const space = spaces.find(s => s.id === id);
    return space ? space as CompleteSpace : null;
  }, [spaces]);
  
  return { 
    spaces, 
    totalSpaces, 
    loading: isLoading, 
    error,
    getSpaceById
  };
};
