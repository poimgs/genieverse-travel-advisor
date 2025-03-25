import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw } from 'lucide-react';
import { ChatMessage, Location } from '../types';
import LocationCard from './LocationCard';

interface ChatInterfaceProps {
  pinnedLocations: Location[];
  onPinLocation: (location: Location) => void;
  onViewAllLocations: () => void;
  recommendedLocations: Location[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  pinnedLocations, 
  onPinLocation, 
  onViewAllLocations,
  recommendedLocations 
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your Singapore travel assistant. How can I help you discover Singapore today?',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'user',
        content: input,
      },
    ]);

    // Simulate bot response with delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: generateResponse(input),
          recommendedLocations: recommendedLocations.slice(0, 2) // Show max 2 recommendations
        },
      ]);
    }, 1000);

    setInput('');
  };

  const generateResponse = (userInput: string): string => {
    const userInputLower = userInput.toLowerCase();
    
    if (userInputLower.includes('food') || userInputLower.includes('eat')) {
      return "Singapore is a food paradise! I recommend checking out the hawker centers like Maxwell Food Centre. You can also use the filters on the left to narrow down your options based on location and budget.";
    } else if (userInputLower.includes('nature') || userInputLower.includes('park')) {
      return "For nature lovers, Gardens by the Bay and Singapore Zoo are must-visit attractions. You can refine your search using the filters on the left sidebar.";
    } else if (userInputLower.includes('shopping')) {
      return "Orchard Road is Singapore's main shopping district. Marina Bay Sands also has a luxury mall. Use the filters to explore more options!";
    } else {
      return "Singapore has so much to offer! You can explore Gardens by the Bay, Sentosa Island, or Chinatown. Feel free to use the filters on the left to refine your search, or click the button below to browse all locations.";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-cyan-400 p-4">
        <h2 className="text-white text-xl font-semibold">Singapore Travel Assistant</h2>
        <button 
          onClick={onViewAllLocations}
          className="flex items-center bg-white text-blue-500 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
        >
          Browse Filtered Locations
        </button>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.type === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white rounded-tr-none'
                  : 'bg-gray-100 rounded-tl-none'
              }`}
            >
              {message.content}
            </div>
            
            {message.recommendedLocations && message.recommendedLocations.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 w-full">
                {message.recommendedLocations.map((location) => (
                  <LocationCard 
                    key={location.id} 
                    location={location} 
                    isPinned={pinnedLocations.some(loc => loc.id === location.id)}
                    onPin={() => onPinLocation(location)}
                    compact={true}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-2">
          <button 
            type="button" 
            className="p-2 text-gray-500 hover:text-blue-500"
            onClick={() => setMessages([{
              id: '1',
              type: 'bot',
              content: 'Hello! I\'m your Singapore travel assistant. How can I help you discover Singapore today?',
            }])}
          >
            <RefreshCw size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about places to visit in Singapore..."
            className="flex-grow p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;