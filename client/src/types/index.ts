export interface Location {
  id: string;
  title: string;
  imageUrl: string;
  categories: string[];
  area: string;
  priceRange: string;
  audiences: string[];
  operatingHours: string;
  themes: string[];
  address: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: Array<{
    type: 'text' | 'function';
    text?: string;
  }>;
  tool_calls?: Array<{
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
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