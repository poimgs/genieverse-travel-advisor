import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw } from 'lucide-react';
import { ChatMessage, Location } from '../types';
import LocationCard from './LocationCard';
import LocationModal from './LocationModal';
import { streamChat } from '../services/api';

interface ChatInterfaceProps {
  pinnedLocations: Location[];
  onPinLocation: (location: Location) => void;
  onViewAllLocations: () => void;
  filteredLocations: Location[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  pinnedLocations, 
  onPinLocation, 
  onViewAllLocations,
  filteredLocations
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: 'Hello! I\'m your Singapore travel assistant. How can I help you discover Singapore today?',
        },
      ],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRecommendedLocationIds, setCurrentRecommendedLocationIds] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCurrentRecommendedLocations = () => {
    return filteredLocations.filter(location => 
      currentRecommendedLocationIds.includes(location.id)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: [
        {
          type: 'text',
          text: input,
        },
      ],
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    const botMessageId = (Date.now() + 1).toString();
    const botMessage: ChatMessage = {
      id: botMessageId,
      role: 'assistant',
      content: [],
    };

    setMessages(prev => [...prev, botMessage]);
    let accumulatedContent = '';

    try {
      await streamChat(
        messages.concat(userMessage),
        filteredLocations.map(loc => loc.id),
        input,
        (data) => {
          switch (data.type) {
            case 'content':
              setMessages(prev => {
                const updatedMessages = [...prev];
                const botMessageIndex = updatedMessages.findIndex(msg => msg.id === botMessageId);
                if (botMessageIndex !== -1) {
                  updatedMessages[botMessageIndex] = {
                    ...updatedMessages[botMessageIndex],
                    content: [{ type: 'text', text: data.content }],
                  };
                }
                return updatedMessages;
              });
              // Update recommended locations if provided
              if (data.locationIds) {
                setCurrentRecommendedLocationIds(data.locationIds);
              }
              break;

            case 'partial':
              accumulatedContent += data.content;
              if (accumulatedContent.endsWith('\n') || accumulatedContent.length > 100) {
                setMessages(prev => {
                  const updatedMessages = [...prev];
                  const botMessageIndex = updatedMessages.findIndex(msg => msg.id === botMessageId);
                  if (botMessageIndex !== -1) {
                    updatedMessages[botMessageIndex] = {
                      ...updatedMessages[botMessageIndex],
                      content: [{ type: 'text', text: accumulatedContent }],
                    };
                  }
                  return updatedMessages;
                });
              }
              break;

            case 'tool_response':
              if (data.name === 'retrieve_locations') {
                setMessages(prev => prev.map(msg =>
                  msg.id === botMessageId
                    ? { ...msg, recommendedLocations: data.content }
                    : msg
                ));
              }
              break;

            case 'error':
              console.error('Stream error:', data.content);
              setMessages(prev => prev.map(msg =>
                msg.id === botMessageId
                  ? { 
                      ...msg, 
                      content: [{ 
                        type: 'text', 
                        text: (msg.content?.[0]?.text || '') + '\n\nI apologize, but I encountered an error.'
                      }],
                    }
                  : msg
              ));
              break;
          }
        }
      );
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: [{
          type: 'text',
          text: 'I apologize, but I encountered an error. Please try again.'
        }],
        recommendedLocations: [],
      }]);
    } finally {
      setIsLoading(false);
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
              message.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content?.map((part, index) => (
                <span key={index}>
                  {part.type === 'text' ? part.text : part.type}
                </span>
              ))}
            </div>
            {message.role === 'assistant' && 
             message.id === messages[messages.length - 1].id && 
             getCurrentRecommendedLocations().length > 0 && (
              <div className="mt-3 space-y-2 w-full">
                <p className="text-sm text-gray-600">Recommended locations:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {getCurrentRecommendedLocations().map((location) => (
                    <LocationCard
                      key={location.id}
                      location={location}
                      isPinned={pinnedLocations.some(pin => pin.id === location.id)}
                      onPin={() => onPinLocation(location)}
                      onClick={() => {
                        setSelectedLocation(location);
                        setIsModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <LocationModal
        location={selectedLocation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isPinned={selectedLocation ? pinnedLocations.some(pin => pin.id === selectedLocation.id) : false}
        onPin={() => selectedLocation && onPinLocation(selectedLocation)}
      />

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;