import React from 'react';
import { Location } from '../types';
import { X, MapPin, Clock, Users, Tag, DollarSign, MessageSquare, Pin } from 'lucide-react';

interface LocationModalProps {
  location: Location | null;
  isOpen: boolean;
  onClose: () => void;
  isPinned: boolean;
  onPin: () => void;
}

const LocationModal: React.FC<LocationModalProps> = ({
  location,
  isOpen,
  onClose,
  isPinned,
  onPin,
}) => {
  if (!location) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 z-[100] flex items-center justify-center transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl overflow-hidden shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col z-[100]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-60 sm:h-72 overflow-hidden">
          <img
            src={location.imageUrl}
            alt={location.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">{location.title}</h2>
            <div className="flex space-x-2">
              <button
                onClick={onPin}
                className={`p-2 rounded-full bg-white/90 ${
                  isPinned ? 'text-red-500' : 'text-gray-700 hover:text-red-500'
                }`}
              >
                <Pin size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/90 text-gray-700 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
              <MapPin size={16} className="mr-1.5" />
              <span className="text-sm">{location.address}</span>
            </div>
            <div className="flex items-center text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
              <Clock size={16} className="mr-1.5" />
              <span className="text-sm">{location.operatingHours}</span>
            </div>
            <div className="flex items-center text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
              <DollarSign size={16} className="mr-1.5" />
              <span className="text-sm">{location.priceRange}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 flex items-center mb-1">
                  <Tag size={16} className="mr-1.5" /> Category
                </p>
                <p className="font-medium">{location.categories.join(', ')}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 flex items-center mb-1">
                  <Users size={16} className="mr-1.5" /> Suitable For
                </p>
                <div className="flex flex-wrap gap-2">
                  {location.audiences.map((audience) => (
                    <span
                      key={audience}
                      className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-sm"
                    >
                      {audience}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 flex items-center mb-1">
                  <Tag size={16} className="mr-1.5" /> Themes
                </p>
                <div className="flex flex-wrap gap-2">
                  {location.themes.map((theme) => (
                    <span
                      key={theme}
                      className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full text-sm"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">About</h3>
            <p className="text-gray-700">{location.description}</p>
          </div>
        </div>

        <div className="border-t p-4 flex justify-between items-center">
          <button
            className="flex items-center text-blue-500 hover:text-blue-700"
          >
            <MessageSquare size={18} className="mr-2" />
            Message Creator
          </button>
          <button
            onClick={onPin}
            className={`flex items-center px-4 py-2 rounded-lg border ${
              isPinned
                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Pin size={18} className="mr-2" />
            {isPinned ? 'Unpin Location' : 'Pin Location'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;