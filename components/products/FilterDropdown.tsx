// components/products/FilterDropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface FilterOption {
  value: any;
  label: string;
}

interface FilterDropdownProps {
  title: string;
  value: any;
  options: FilterOption[];
  onSelect: (value: any) => void;
  multiSelect?: boolean;
  compact?: boolean;
}

export default function FilterDropdown({ 
  title, 
  value, 
  options, 
  onSelect, 
  multiSelect = false,
  compact = false 
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get display label for current selection
  const getDisplayLabel = () => {
    if (multiSelect && Array.isArray(value) && value.length > 0) {
      const selectedLabels = options
        .filter(opt => Array.isArray(opt.value) && opt.value.some(v => value.includes(v)))
        .map(opt => opt.label);
      
      if (selectedLabels.length === 1) return selectedLabels[0];
      if (selectedLabels.length > 1) return `${selectedLabels.length} selected`;
    } else if (!multiSelect) {
      const selectedOption = options.find(opt => opt.value === value);
      if (selectedOption && selectedOption.value !== '' && selectedOption.value !== false) {
        return selectedOption.label;
      }
    }
    return compact ? title : title;
  };

  const handleSelect = (optionValue: any) => {
    if (multiSelect) {
      // For multi-select, handle array of sizes
      const currentValues = Array.isArray(value) ? value : [];
      
      if (Array.isArray(optionValue)) {
        // Toggle the specific size
        const newValue = optionValue[0]; // Get the actual size value (e.g., 'M')
        const newValues = currentValues.includes(newValue)
          ? currentValues.filter(v => v !== newValue)
          : [...currentValues, newValue];
        onSelect(newValues);
      }
    } else {
      // For single select
      onSelect(optionValue);
      setIsOpen(false);
    }
  };

  const isActive = multiSelect 
    ? Array.isArray(value) && value.length > 0
    : value !== '' && value !== false;

  const displayLabel = getDisplayLabel();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
          compact ? 'px-2 py-1 text-xs' : ''
        } ${
          isActive
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg hover:shadow-blue-500/25'
            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600'
        }`}
      >
        <span className={`max-w-[120px] truncate ${compact ? 'max-w-[80px]' : ''}`}>
          {displayLabel}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''} ${
            compact ? 'w-3 h-3' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
          {options.map((option) => {
            const isSelected = multiSelect
              ? Array.isArray(value) && Array.isArray(option.value) && option.value.some(v => value.includes(v))
              : value === option.value;

            return (
              <button
                key={JSON.stringify(option.value)}
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}