import { useState, useCallback, useEffect, useRef } from 'react';
import { FilterState } from '@/lib/types';
import { queryClient } from '@/lib/queryClient';
import { API_BASE_URL } from '@/lib/config';

export const useFilters = (autoApplyDelay = 200) => {
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
  
  // Timer for debounced filter application
  const timerRef = useRef<number | null>(null);
  
  // Update a filter value
  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));

    // If autoApplyDelay is enabled, set up a timer to apply filters
    if (autoApplyDelay > 0) {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      
      timerRef.current = window.setTimeout(() => {
        applyFilters();
      }, autoApplyDelay);
    }
  }, [autoApplyDelay]);
  
  // Reset filters to default
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setActiveFilters(initialFilters);
    
    // Invalidate queries to re-fetch with default filters
    queryClient.invalidateQueries({ queryKey: ['spaces'] });
  }, [initialFilters]);
  
  // Apply current filters
  const applyFilters = useCallback(() => {
    setActiveFilters(filters);
    
    // Invalidate queries to re-fetch with new filters
    queryClient.invalidateQueries({ queryKey: ['spaces'] });
  }, [filters]);
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  return {
    filters,
    activeFilters,
    updateFilter,
    resetFilters,
    applyFilters
  };
};
