import React from 'react';
import { Location } from '../types';
import { Pin, MapPin } from 'lucide-react';

interface LocationCardProps {
  location: Location;
  isPinned: boolean;
  onPin: () => void;
  onClick?: () => void;
  compact?: boolean;
}

const LocationCard: React.FC<LocationCardProps> = ({ 
  location, 
  isPinned, 
  onPin, 
  onClick,
  compact = false 
}) => {
  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPin();
  };

  if (compact) {
    return (
      <div 
        className="flex overflow-hidden bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <div className="w-24 h-24 flex-shrink-0">
          <img
            src={location.imageUrl}
            alt={location.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-3 flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-sm">{location.title}</h3>
            <button
              onClick={handlePin}
              className={`p-1 rounded-full ${
                isPinned ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Pin size={16} />
            </button>
          </div>
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {location.category}
            </span>
            <span className="ml-2 flex items-center">
              <MapPin size={12} className="mr-0.5" /> {location.area}
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {location.priceRange}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-48">
        <img
          src={location.imageUrl}
          alt={location.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={handlePin}
          className={`absolute top-2 right-2 p-2 rounded-full ${
            isPinned 
              ? 'bg-white text-red-500' 
              : 'bg-white/70 text-gray-700 hover:bg-white hover:text-red-400'
          }`}
        >
          <Pin size={18} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{location.title}</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
            {location.category}
          </span>
          <span className="flex items-center text-gray-500 text-xs">
            <MapPin size={12} className="mr-0.5" /> {location.area}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-700">{location.priceRange}</span>
          <span className="text-gray-500 text-xs">{location.operatingHours}</span>
        </div>
      </div>
    </div>
  );
};

export default LocationCard;