import React from 'react';
import { Filters, FilterOptions } from '../types';
import { Sliders } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';

interface FilterSidebarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filterOptions: FilterOptions;
  isMobile: boolean;
  toggleMobileFilters: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  filters, 
  setFilters, 
  filterOptions,
  isMobile,
  toggleMobileFilters
}) => {
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      category: value === 'All' ? undefined : value
    }));
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      area: value === 'All' ? undefined : value
    }));
  };

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      priceRange: value === 'All' ? undefined : value
    }));
  };

  const handleOperatingHoursChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      operatingHours: value === 'All' ? undefined : value
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  if (isMobile) {
    return (
      <div className="fixed bottom-4 left-4 z-10">
        <button
          onClick={toggleMobileFilters}
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
        >
          <Sliders size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
        <button
          onClick={handleClearFilters}
          className="text-sm text-blue-500 hover:text-blue-700"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={filters.category || 'All'}
            onChange={handleCategoryChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            {filterOptions.categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Area Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Area
          </label>
          <select
            value={filters.area || 'All'}
            onChange={handleAreaChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            {filterOptions.areas.map(area => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Range
          </label>
          <select
            value={filters.priceRange || 'All'}
            onChange={handlePriceRangeChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            {filterOptions.priceRanges.map(price => (
              <option key={price} value={price}>
                {price}
              </option>
            ))}
          </select>
        </div>

        {/* Operating Hours Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Operating Hours
          </label>
          <select
            value={filters.operatingHours || 'All'}
            onChange={handleOperatingHoursChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            {filterOptions.operatingHours.map(hours => (
              <option key={hours} value={hours}>
                {hours}
              </option>
            ))}
          </select>
        </div>

        {/* Audience Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audience
          </label>
          <SearchableDropdown
            options={filterOptions.audiences}
            selected={filters.audience || []}
            onChange={(selected) => setFilters(prev => ({ ...prev, audience: selected }))}
            placeholder="Search audience types..."
          />
        </div>

        {/* Themes Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Themes
          </label>
          <SearchableDropdown
            options={filterOptions.themes}
            selected={filters.themes || []}
            onChange={(selected) => setFilters(prev => ({ ...prev, themes: selected }))}
            placeholder="Search themes..."
          />
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;