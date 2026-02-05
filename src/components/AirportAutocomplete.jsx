import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plane, MapPin, Search, X } from 'lucide-react';
import { searchAirports, getAirportByCode } from '../utils/airports';
import { debounce } from '../utils/helpers';

export function AirportAutocomplete({
  value,
  onChange,
  placeholder = 'Search airport...',
  label,
  error,
  required = false,
  disabled = false,
  className = '',
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Initialize with existing value
  useEffect(() => {
    if (value && !selectedAirport) {
      const airport = getAirportByCode(value);
      if (airport) {
        setSelectedAirport(airport);
        setQuery(`${airport.code} - ${airport.city}`);
      } else {
        setQuery(value);
      }
    }
  }, [value, selectedAirport]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      if (searchQuery.length >= 1) {
        const searchResults = searchAirports(searchQuery, 8);
        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
        setHighlightedIndex(-1);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 150),
    []
  );

  // Handle input change
  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setSelectedAirport(null);

    if (newQuery.length === 0) {
      onChange('');
      setResults([]);
      setIsOpen(false);
    } else {
      debouncedSearch(newQuery);
    }
  };

  // Handle selection
  const handleSelect = (airport) => {
    setSelectedAirport(airport);
    setQuery(`${airport.code} - ${airport.city}`);
    onChange(airport.code);
    setIsOpen(false);
    setResults([]);
    inputRef.current?.blur();
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setSelectedAirport(null);
    onChange('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' && query.length >= 1) {
        debouncedSearch(query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current?.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const item = dropdownRef.current.children[highlightedIndex];
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Plane className="w-4 h-4 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 1 && results.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`input pl-10 pr-10 ${error ? 'input-error' : ''} ${
            selectedAirport ? 'font-medium' : ''
          }`}
          autoComplete="off"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />

        {query && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto"
          role="listbox"
        >
          {results.map((airport, index) => (
            <button
              key={airport.code}
              type="button"
              onClick={() => handleSelect(airport)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                highlightedIndex === index
                  ? 'bg-primary-50'
                  : 'hover:bg-gray-50'
              }`}
              role="option"
              aria-selected={highlightedIndex === index}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-700">
                    {airport.code}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {airport.city}, {airport.country}
                </p>
                <p className="text-xs text-gray-500 truncate">{airport.name}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-3 text-gray-500">
            <Search className="w-5 h-5" />
            <span className="text-sm">No airports found for "{query}"</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function AirportDisplay({ code, showDetails = false, className = '' }) {
  const airport = getAirportByCode(code);

  if (!airport) {
    return (
      <span className={`font-mono font-medium ${className}`}>{code || '---'}</span>
    );
  }

  if (!showDetails) {
    return (
      <span className={`font-medium ${className}`} title={airport.name}>
        {airport.code}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-gray-700">{airport.code}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {airport.city}
        </p>
        <p className="text-xs text-gray-500 truncate">{airport.name}</p>
      </div>
    </div>
  );
}

export function FlightRoute({ from, to, className = '' }) {
  const fromAirport = getAirportByCode(from);
  const toAirport = getAirportByCode(to);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="text-center">
        <p className="text-lg font-bold text-gray-900">{from || '---'}</p>
        {fromAirport && (
          <p className="text-xs text-gray-500">{fromAirport.city}</p>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center px-2">
        <div className="flex-1 h-px bg-gray-300" />
        <Plane className="w-4 h-4 text-primary-500 mx-2 transform rotate-90" />
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      <div className="text-center">
        <p className="text-lg font-bold text-gray-900">{to || '---'}</p>
        {toAirport && (
          <p className="text-xs text-gray-500">{toAirport.city}</p>
        )}
      </div>
    </div>
  );
}

export default AirportAutocomplete;
