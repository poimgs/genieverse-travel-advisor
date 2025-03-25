import { useEffect, useState } from 'react';
import { FilterOptions } from '../types';
import { getFilterOptions } from '../services/api';

export const FALLBACK_FILTER_OPTIONS: FilterOptions = {
  categories: ['All', 'Nature', 'Cultural', 'Landmark', 'Entertainment', 'Food'],
  areas: ['All', 'Marina Bay', 'Chinatown', 'Sentosa', 'Mandai', 'Orchard'],
  priceRanges: ['All', '$', '$$', '$$$'],
  operatingHours: ['All', 'Morning', 'Afternoon', 'Evening', '24 Hours'],
  themes: ['All', 'Nature', 'Cultural', 'Historical', 'Entertainment', 'Food'],
  audiences: ['All', 'Family', 'Couples', 'Solo', 'Friends']
};

export const useFilterOptions = () => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(FALLBACK_FILTER_OPTIONS);

  useEffect(() => {
    getFilterOptions()
      .then(setFilterOptions)
      .catch(error => {
        console.error('Failed to fetch filter options:', error);
        // Keep using fallback options that were set in initial state
      });
  }, []);

  return filterOptions;
};
