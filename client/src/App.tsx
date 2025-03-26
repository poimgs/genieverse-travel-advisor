import React, { useState, useEffect } from 'react';
import { Bookmark, MapPin } from 'lucide-react';
import { Location, Filters } from './types';
import { useFilterOptions } from './hooks/useFilterOptions';

// Components
import ChatInterface from './components/ChatInterface';
import FilterSidebar from './components/FilterSidebar';
import LocationCatalog from './components/LocationCatalog';
import LocationModal from './components/LocationModal';
import PinnedLocations from './components/PinnedLocations';
import MobileFilters from './components/MobileFilters';
import { getLocations } from './services/api';

function App() {
  const [pinnedLocations, setPinnedLocations] = useState<Location[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const filterOptions = useFilterOptions();
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isPinnedModalOpen, setIsPinnedModalOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [recommendedLocations, setRecommendedLocations] = useState<Location[]>([]);

  // Fetch locations from API
  useEffect(() => {
    const loadLocations = async () => {
      const locations = await getLocations();
      setAllLocations(locations);
      setFilteredLocations(locations);
    };
    loadLocations();
  }, []);

  // Check if mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update filtered locations when filters change
  useEffect(() => {
    const filtered = allLocations.filter(location => {
      // Filter by category
      if (filters.category && filters.category !== "All" && !location.categories.includes(filters.category)) {
        return false;
      }
      
      // Filter by area
      if (filters.area && filters.area !== "All" && location.area !== filters.area) {
        return false;
      }
      
      // Filter by price range
      if (filters.priceRange && filters.priceRange !== "All" && location.priceRange !== filters.priceRange) {
        return false;
      }
      
      // Filter by audience (any match)
      if (filters.audience && filters.audience.length > 0 && !filters.audience.includes("All")) {
        const hasAudience = filters.audience.some(audience => 
          location.audience.includes(audience)
        );
        if (!hasAudience) return false;
      }
      
      // Filter by operating hours
      if (filters.operatingHours && filters.operatingHours !== "All" && !location.operatingHours.includes(filters.operatingHours)) {
        return false;
      }
      
      // Filter by themes (any match)
      if (filters.themes && filters.themes.length > 0 && !filters.themes.includes("All")) {
        const hasTheme = filters.themes.some(theme => 
          location.themes.includes(theme)
        );
        if (!hasTheme) return false;
      }
      
      return true;
    });
    
    setFilteredLocations(filtered);
  }, [filters, allLocations]);

  const handlePinLocation = (location: Location) => {
    setPinnedLocations(prev => {
      const isPinned = prev.some(item => item.id === location.id);
      if (isPinned) {
        return prev.filter(item => item.id !== location.id);
      } else {
        return [...prev, location];
      }
    });
  };

  const handleViewLocationDetails = (location: Location) => {
    setSelectedLocation(location);
    setIsLocationModalOpen(true);
  };

  const toggleMobileFilters = () => {
    setIsMobileFiltersOpen(!isMobileFiltersOpen);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Header for mobile */}
      {isMobileView && (
        <header className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-cyan-500 p-4 shadow-md flex justify-between items-center">
        <h1 className="text-white text-xl font-bold flex items-center">
          <MapPin className="mr-2" /> Singapore Explorer
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPinnedModalOpen(true)}
            className="p-2 bg-white/20 rounded-full text-white"
          >
            <Bookmark size={20} />
          </button>
        </div>
      </header>
      )}

      {/* Left Sidebar - Filters */}
      {!isMobileView && (
        <aside className="w-72 p-4 hidden md:block">
        <div className="sticky top-4">
          <div className="mb-6 flex flex-col">
            <h1 className="text-2xl font-bold mb-1 flex items-center">
              <MapPin className="mr-2 text-blue-500" /> Singapore Explorer
            </h1>
            <p className="text-gray-600 text-sm">Find the perfect spots for your trip</p>
          </div>
          
          <FilterSidebar 
            filters={filters} 
            setFilters={setFilters} 
            filterOptions={filterOptions}
            isMobile={isMobileView}
            toggleMobileFilters={toggleMobileFilters}
          />

          <div className="mt-4">
            <button
              onClick={() => setIsPinnedModalOpen(true)}
              className="flex items-center text-gray-700 p-2 w-full hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bookmark className="mr-2 text-blue-500" />
              <span>Pinned Locations ({pinnedLocations.length})</span>
            </button>
          </div>
        </div>
      </aside>
      )}

      {/* Mobile Filters FAB */}
      {isMobileView && (
        <FilterSidebar 
          filters={filters} 
          setFilters={setFilters} 
          filterOptions={filterOptions}
          isMobile={isMobileView}
          toggleMobileFilters={toggleMobileFilters}
        />
      )}

      {/* Mobile Filters Drawer */}
      <MobileFilters 
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
      />

      {/* Main Content - Chat Interface */}
      <main className="flex-1 p-4 mb-16 md:mb-0">
        <ChatInterface 
          pinnedLocations={pinnedLocations}
          onPinLocation={handlePinLocation}
          onViewAllLocations={() => setIsCatalogOpen(true)}
          recommendedLocations={recommendedLocations}
        />
      </main>

      {/* Location Catalog Drawer */}
      <LocationCatalog 
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        locations={filteredLocations}
        pinnedLocations={pinnedLocations}
        onPinLocation={handlePinLocation}
        onViewLocationDetails={handleViewLocationDetails}
      />

      {/* Location Detail Modal */}
      <LocationModal 
        location={selectedLocation}
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        isPinned={selectedLocation ? pinnedLocations.some(loc => loc.id === selectedLocation.id) : false}
        onPin={() => {
          if (selectedLocation) {
            handlePinLocation(selectedLocation);
          }
        }}
      />

      {/* Pinned Locations Modal */}
      <PinnedLocations 
        isOpen={isPinnedModalOpen}
        onClose={() => setIsPinnedModalOpen(false)}
        pinnedLocations={pinnedLocations}
        onUnpinLocation={handlePinLocation}
        onViewLocationDetails={handleViewLocationDetails}
      />
    </div>
  );
}

export default App;