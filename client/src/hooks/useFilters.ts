import { useState, useCallback } from 'react';
import { FilterState } from '@/lib/types';
import { queryClient } from '@/lib/queryClient';

export const useFilters = () => {
  // Default filter state
  const initialFilters: FilterState = {
    location: undefined,
    priceMin: undefined,
    priceMax: undefined,
    rating: undefined,
    services: []
  };
  
  // Form state for filters (before applying)
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  
  // Active filters that are actually applied
  const [activeFilters, setActiveFilters] = useState<FilterState>(initialFilters);
  
  // Update a filter value
  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);
  
  // Reset filters to default
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setActiveFilters(initialFilters);
    
    // Invalidate queries to re-fetch with default filters
    queryClient.invalidateQueries({ queryKey: ['/api/spaces'] });
  }, [initialFilters]);
  
  // Apply current filters
  const applyFilters = useCallback(() => {
    setActiveFilters(filters);
    
    // Invalidate queries to re-fetch with new filters
    queryClient.invalidateQueries({ queryKey: ['/api/spaces'] });
  }, [filters]);
  
  return {
    filters,
    activeFilters,
    updateFilter,
    resetFilters,
    applyFilters
  };
};
