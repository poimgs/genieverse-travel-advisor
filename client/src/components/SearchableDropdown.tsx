import React, { useState, useRef, useEffect } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';

interface SearchableDropdownProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  selected,
  onChange,
  placeholder
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(search.toLowerCase()) &&
    !selected.includes(option)
  );

  const handleSelect = (option: string) => {
    onChange([...selected, option]);
    setSearch('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRemove = (optionToRemove: string) => {
    onChange(selected.filter(option => option !== optionToRemove));
  };
  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`border rounded-lg p-2 min-h-[42px] cursor-text ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'
        }`}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <div className="flex flex-wrap gap-2">
          {selected.map(item => (
            <span
              key={item}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
            >
              {item}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item);
                }}
                className="ml-1 hover:text-blue-600"
              >
                <X size={14} />
              </button>
            </span>
          ))}
          <div className="flex-1 relative flex items-center min-w-[120px]">
            <Search size={16} className="text-gray-400 absolute left-1" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={selected.length === 0 ? placeholder : ''}
              className="pl-7 pr-2 py-1 outline-none bg-transparent w-full text-sm"
            />
          </div>
        </div>
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown size={20} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="p-2 text-sm text-gray-500 text-center">
              No options found
            </div>
          ) : (
            <div className="py-1">
              {filteredOptions.map(option => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 outline-none"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
);
};

export default SearchableDropdown;