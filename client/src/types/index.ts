export interface Location {
  id: string;
  title: string;
  imageUrl: string;
  categories: string[];
  area: string;
  priceRange: string;
  audience: string[];
  operatingHours: string;
  themes: string[];
  address: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  recommendedLocations?: Location[];
}

export interface FilterOptions {
  categories: string[];
  areas: string[];
  priceRanges: string[];
  audiences: string[];
  operatingHours: string[];
  themes: string[];
}

export interface Filters {
  category?: string;
  area?: string;
  priceRange?: string;
  audience?: string[];
  operatingHours?: string;
  themes?: string[];
}