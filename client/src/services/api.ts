import { FilterOptions, Location } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export const getFilterOptions = async (): Promise<FilterOptions> => {
  try {
    const response = await fetch(`${API_BASE_URL}/filters`);
    const data = await response.json();
    
    return {
      categories: ['All', ...data.category],
      areas: ['All', ...data.location],
      priceRanges: ['All', ...data.price],
      operatingHours: ['All', 'Morning', 'Afternoon', 'Evening', '24 Hours'],
      themes: ['All', ...data.theme],
      audiences: ['All', ...data.audiences]
    };
  } catch (error) {
    console.error('Failed to fetch filter options:', error);
    // Fallback filter options in case the server is not available
    return {
      categories: ['All', 'Nature', 'Cultural', 'Landmark', 'Entertainment', 'Food'],
      areas: ['All', 'Marina Bay', 'Chinatown', 'Sentosa', 'Mandai', 'Orchard'],
      priceRanges: ['All', '$', '$$', '$$$'],
      operatingHours: ['All', 'Morning', 'Afternoon', 'Evening', '24 Hours'],
      themes: ['All', 'Nature', 'Cultural', 'Historical', 'Entertainment', 'Food'],
      audiences: ['All', 'Family', 'Couples', 'Solo', 'Friends']
    };
  }
};

export const getLocations = async (): Promise<Location[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/locations`);
    const data = await response.json();
    return data.map((location: any) => ({
      id: location.id,
      title: location.title,
      link: location.link,
      address: location.address,
      content: location.content,
      location: location.location,
      categories: location.categories,
      themes: location.themes,
      priceRange: location.priceRange,
      audiences: location.audiences,
      operatingHours: location.operatingHours,
      imageUrl: '', // Note: We'll need to add image URLs to the CSV data
    }));
  } catch (error) {
    console.error('Failed to fetch locations:', error);
    return []; // Return empty array in case of error
  }
};
