import React from 'react';
import { Filters, FilterOptions } from '../types';
import { X } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';

interface MobileFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filterOptions: FilterOptions;
}

const MobileFilters: React.FC<MobileFiltersProps> = ({ 
  isOpen, 
  onClose, 
  filters, 
  setFilters, 
  filterOptions 
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

  return (
    <div
      className={`fixed inset-0 bg-black/50 z-50 transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white shadow-lg transform transition-transform overflow-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Filters</h2>
          <div className="flex gap-2">
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-500"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
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

        <div className="sticky bottom-0 bg-white p-4 border-t">
          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilters;