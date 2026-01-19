'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { DrugSearchResult } from '@/types/drug-interactions';
import { DRUG_CATEGORY_LABELS } from '@/types/drug-interactions';

interface DrugSearchInputProps {
  onSelect: (drug: DrugSearchResult) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function DrugSearchInput({
  onSelect,
  placeholder = 'Enter medication name...',
  autoFocus = false,
}: DrugSearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DrugSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/tools/interactions/search?q=${encodeURIComponent(query)}&limit=8`
        );
        const data = await response.json();
        setResults(data.results || []);
        setIsOpen(true);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (drug: DrugSearchResult) => {
      setQuery('');
      setResults([]);
      setIsOpen(false);
      onSelect(drug);
    },
    [onSelect]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
          aria-label="Search for a medication"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          role="combobox"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
        {!isLoading && query.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto"
          role="listbox"
        >
          {results.map((drug, index) => (
            <button
              key={drug.id}
              type="button"
              onClick={() => handleSelect(drug)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
                highlightedIndex === index ? 'bg-blue-50' : ''
              } ${index !== results.length - 1 ? 'border-b border-gray-100' : ''}`}
              role="option"
              aria-selected={highlightedIndex === index}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">
                    {drug.display_name}
                  </div>
                  {drug.brand_names.length > 0 && (
                    <div className="text-sm text-gray-500">
                      {drug.brand_names.slice(0, 3).join(', ')}
                      {drug.brand_names.length > 3 && '...'}
                    </div>
                  )}
                  {drug.match_type === 'brand' && drug.matched_term && (
                    <div className="text-xs text-blue-600 mt-0.5">
                      Matched: {drug.matched_term}
                    </div>
                  )}
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap ml-2">
                  {DRUG_CATEGORY_LABELS[drug.category] || drug.category}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <p className="text-gray-600 text-sm">
            No medications found for &quot;{query}&quot;
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Try a different spelling or the generic name
          </p>
        </div>
      )}
    </div>
  );
}
