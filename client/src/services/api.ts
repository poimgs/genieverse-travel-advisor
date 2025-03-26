import { FilterOptions, Location, ChatMessage } from '../types';

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

export type ChatResponse = {
  type: 'content' | 'partial' | 'tool_response' | 'error';
  content: string;
  locationIds?: string[];
  name?: string;
};

export const streamChat = async (
  messages: ChatMessage[],
  locationIds: string[],
  userPrompt: string,
  onChunkReceived: (data: ChatResponse) => void
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        locationIds,
        userPrompt,
      }),
    });

    if (!response.ok) throw new Error('Chat request failed');
    
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response stream');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = new TextDecoder().decode(value);
      const events = text.split('\n\n').filter(Boolean);

      for (const event of events) {
        if (!event.startsWith('data: ')) continue;
        const data = JSON.parse(event.slice(6));
        onChunkReceived(data);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
