import React, { useRef } from 'react';
import { Location } from '../types';
import LocationCard from './LocationCard';
import { X } from 'lucide-react';

interface LocationCatalogProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  pinnedLocations: Location[];
  onPinLocation: (location: Location) => void;
  onViewLocationDetails: (location: Location) => void;
}

const LocationCatalog: React.FC<LocationCatalogProps> = ({
  isOpen,
  onClose,
  locations,
  pinnedLocations,
  onPinLocation,
  onViewLocationDetails,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-3/4 lg:w-2/3 bg-gray-50 shadow-lg transform transition-transform overflow-hidden flex flex-col z-40 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 bg-white shadow-sm flex justify-between items-center">
          <h2 className="text-xl font-semibold">Explore Singapore</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {locations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-xl">No locations match your filters</p>
              <p className="mt-2">Try adjusting your filters to see more results</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  isPinned={pinnedLocations.some((loc) => loc.id === location.id)}
                  onPin={() => onPinLocation(location)}
                  onClick={() => onViewLocationDetails(location)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationCatalog;