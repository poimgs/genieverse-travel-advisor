import React from 'react';
import { Location } from '../types';
import { X, Pin } from 'lucide-react';

interface PinnedLocationsProps {
  isOpen: boolean;
  onClose: () => void;
  pinnedLocations: Location[];
  onUnpinLocation: (location: Location) => void;
  onViewLocationDetails: (location: Location) => void;
}

const PinnedLocations: React.FC<PinnedLocationsProps> = ({
  isOpen,
  onClose,
  pinnedLocations,
  onUnpinLocation,
  onViewLocationDetails,
}) => {
  return (
    <div
      className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl overflow-hidden shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center">
            <Pin size={20} className="text-red-500 mr-2" />
            <h2 className="text-xl font-semibold">Pinned Locations</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {pinnedLocations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <Pin size={32} className="mb-2 opacity-30" />
              <p>No pinned locations yet</p>
              <p className="text-sm mt-1">Pin locations to save them for later</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pinnedLocations.map((location) => (
                <div
                  key={location.id}
                  className="flex overflow-hidden bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div 
                    className="w-24 h-24 flex-shrink-0 cursor-pointer"
                    onClick={() => onViewLocationDetails(location)}
                  >
                    <img
                      src={location.imageUrl}
                      alt={location.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 
                        className="font-medium text-sm cursor-pointer hover:text-blue-600"
                        onClick={() => onViewLocationDetails(location)}
                      >
                        {location.title}
                      </h3>
                      <button
                        onClick={() => onUnpinLocation(location)}
                        className="p-1 rounded-full text-red-500 hover:bg-red-50"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{location.category} • {location.area}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{location.priceRange}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PinnedLocations;