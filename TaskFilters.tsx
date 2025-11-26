import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { CATEGORY_GROUPS } from '../lib/categories';
import LocationAutocomplete from './LocationAutocomplete';
import DualRangeSlider from './DualRangeSlider';

interface TaskFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters: FilterState;
}

export interface FilterState {
  selectedCategories: string[];
  taskType: 'all' | 'in-person' | 'remote';
  location: string;
  locationLat: number | null;
  locationLng: number | null;
  city: string;
  distance: number;
  priceRange: [number, number];
  availableOnly: boolean;
  noOffersOnly: boolean;
}

export default function TaskFilters({ isOpen, onClose, onApply, initialFilters }: TaskFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  if (!isOpen) return null;

  const handleCategoryToggle = (category: string) => {
    setFilters(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter(c => c !== category)
        : [...prev.selectedCategories, category]
    }));
  };

  const handleTaskTypeChange = (type: 'all' | 'in-person' | 'remote') => {
    if (type === 'remote') {
      // Clear location and distance when selecting remote
      setFilters(prev => ({
        ...prev,
        taskType: 'remote',
        location: '',
        locationLat: null,
        locationLng: null,
        city: '',
        distance: 5
      }));
    } else {
      setFilters(prev => ({ ...prev, taskType: type }));
    }
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      selectedCategories: [],
      taskType: 'all',
      location: '',
      locationLat: null,
      locationLng: null,
      city: '',
      distance: 5,
      priceRange: [0, 10000],
      availableOnly: true,
      noOffersOnly: true
    };
    setFilters(resetFilters);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const getCategoryDisplayText = () => {
    if (filters.selectedCategories.length === 0) return 'קטגוריה';
    if (filters.selectedCategories.length === 1) return filters.selectedCategories[0];
    return `${filters.selectedCategories[0]} & ${filters.selectedCategories.length - 1} עוד`;
  };

  const allSubcategories = CATEGORY_GROUPS.flatMap(group => group.subcategories);
  const allSelected = allSubcategories.length > 0 && filters.selectedCategories.length === allSubcategories.length;

  const handleSelectAllCategories = () => {
    if (allSelected) {
      setFilters(prev => ({ ...prev, selectedCategories: [] }));
    } else {
      setFilters(prev => ({ ...prev, selectedCategories: [...allSubcategories] }));
    }
  };


  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col" dir="rtl">
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-primary-dark">סינון</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Categories */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-primary-dark">קטגוריות</label>
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full px-4 py-3 bg-gray-100 rounded-lg text-right flex items-center justify-between hover:bg-gray-200 transition-colors"
            >
              <span className={filters.selectedCategories.length === 0 ? 'text-gray-400' : 'text-gray-900'}>
                {getCategoryDisplayText()}
              </span>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-20">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2 z-10">
                  <button
                    onClick={handleSelectAllCategories}
                    className="w-full px-4 py-2 text-right text-sm font-semibold text-primary-light hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {allSelected ? 'בטל בחירת הכל' : 'בחר הכל'}
                  </button>
                </div>
                {CATEGORY_GROUPS.map((group) => (
                  <div key={group.macro} className="border-b border-gray-100 last:border-b-0">
                    <div className="px-4 py-3 bg-gray-50 font-semibold text-primary-dark text-sm">
                      {group.macro}
                    </div>
                    {group.subcategories.map((subcategory) => {
                      const isSelected = filters.selectedCategories.includes(subcategory);
                      return (
                        <button
                          key={subcategory}
                          onClick={() => handleCategoryToggle(subcategory)}
                          className={`w-full px-4 py-2.5 text-right text-sm hover:bg-gray-50 transition-colors ${
                            isSelected ? 'bg-blue-50 text-primary-light font-medium' : 'text-gray-700'
                          }`}
                        >
                          {subcategory}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* To be done */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-primary-dark">תבוצע</label>
          <div className="flex gap-2">
            <button
              onClick={() => handleTaskTypeChange('in-person')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                filters.taskType === 'in-person'
                  ? 'bg-primary-light text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              פנים אל פנים
            </button>
            <button
              onClick={() => handleTaskTypeChange('remote')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                filters.taskType === 'remote'
                  ? 'bg-primary-light text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              מרחוק
            </button>
            <button
              onClick={() => handleTaskTypeChange('all')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                filters.taskType === 'all'
                  ? 'bg-primary-light text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              הכל
            </button>
          </div>
        </div>

        {/* Location - hidden when remote is selected */}
        {filters.taskType !== 'remote' && (
          <>
            {/* Location */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-primary-dark">מיקום</label>
              <LocationAutocomplete
                value={filters.location}
                onChange={(address, lat, lng, cityName) => {
                  setFilters(prev => ({
                    ...prev,
                    location: address,
                    locationLat: lat,
                    locationLng: lng,
                    city: cityName
                  }));
                }}
                placeholder="עיר או כתובת..."
                className="bg-gray-100"
              />
            </div>

            {/* Distance */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-primary-dark">מרחק</label>
              <div className="px-2">
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={filters.distance}
                  onChange={(e) => setFilters(prev => ({ ...prev, distance: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-light"
                />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>1 ק״מ</span>
                <span className="font-semibold">{filters.distance} ק״מ</span>
                <span>50 ק״מ</span>
              </div>
            </div>
          </>
        )}

        {/* Price */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-primary-dark">מחיר</label>
          <div className="px-2">
            <DualRangeSlider
              min={0}
              max={10000}
              step={100}
              value={filters.priceRange}
              onChange={(newRange) => setFilters(prev => ({ ...prev, priceRange: newRange }))}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>₪0</span>
            <span className="font-semibold">₪{filters.priceRange[0].toLocaleString('he-IL')} - ₪{filters.priceRange[1].toLocaleString('he-IL')}</span>
            <span>₪10,000</span>
          </div>
        </div>

        {/* Other Filters */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <label className="block text-xs font-semibold text-primary-dark uppercase tracking-wide">סינונים נוספים</label>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">משימות זמינות בלבד</p>
              <p className="text-xs text-gray-500">הסתר משימות שכבר הוקצו</p>
            </div>
            <button
              onClick={() => setFilters(prev => ({ ...prev, availableOnly: !prev.availableOnly }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                filters.availableOnly ? 'bg-primary-light' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                filters.availableOnly ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">הצג משימות ללא הצעות</p>
              <p className="text-xs text-gray-500">הסתר משימות שיש להן הצעות</p>
            </div>
            <button
              onClick={() => setFilters(prev => ({ ...prev, noOffersOnly: !prev.noOffersOnly }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                filters.noOffersOnly ? 'bg-primary-light' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                filters.noOffersOnly ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-4 flex gap-3 shadow-lg">
        <button
          onClick={handleReset}
          className="flex-1 px-6 py-3 bg-gray-100 text-primary-dark rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          איפוס
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-6 py-3 bg-primary-light text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
        >
          החל
        </button>
      </div>
    </div>
  );
}
