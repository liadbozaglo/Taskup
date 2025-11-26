import { useRef, useEffect, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (address: string, lat: number, lng: number, city: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'הזן כתובת',
  className = '',
  disabled = false
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
    if (inputRef.current && value !== inputRef.current.value) {
      inputRef.current.value = value;
    }
  }, [value]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      setError('Google Maps API key is not configured');
      setIsLoading(false);
      return;
    }

    if (typeof window.google === 'undefined' || typeof window.google.maps === 'undefined') {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=he`;
      script.async = true;
      script.defer = true;
      script.onload = initializeAutocomplete;
      script.onerror = () => {
        setError('Failed to load Google Maps');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    } else {
      initializeAutocomplete();
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const initializeAutocomplete = () => {
    if (!inputRef.current) return;

    try {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'il' },
        fields: ['formatted_address', 'geometry', 'address_components'],
        types: ['address']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
          return;
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || '';

        let city = '';
        if (place.address_components) {
          const cityComponent = place.address_components.find(
            (component) =>
              component.types.includes('locality') ||
              component.types.includes('administrative_area_level_2')
          );
          city = cityComponent ? cityComponent.long_name : '';
        }

        setInputValue(address);
        onChange(address, lat, lng, city);
      });

      autocompleteRef.current = autocomplete;
      setIsLoading(false);
      setError(null);
    } catch (err) {
      setError('Failed to initialize autocomplete');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  };

  if (error) {
    return (
      <div className="relative">
        <MapPin className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value, 0, 0, '');
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pr-12 pl-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-light transition-colors text-lg text-right ${className}`}
        />
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-red-500 text-right">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <MapPin className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      {isLoading && (
        <Loader2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
      )}
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        className={`w-full pr-12 pl-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-light transition-colors text-lg text-right ${className} ${
          isLoading ? 'bg-gray-50' : ''
        }`}
        autoComplete="off"
      />
    </div>
  );
}
