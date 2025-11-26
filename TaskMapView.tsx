import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Task = Database['public']['Tables']['tasks']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'] | null;
  offerCount?: number;
};

interface TaskMapViewProps {
  tasks: Task[];
  onClose: () => void;
  onTaskClick: (taskId: string) => void;
  userLat?: number | null;
  userLng?: number | null;
}

export default function TaskMapView({ tasks, onClose, onTaskClick, userLat, userLng }: TaskMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      setError('מפתח API של Google Maps לא מוגדר');
      setIsLoading(false);
      return;
    }

    const initializeMap = () => {
      try {
        if (!mapRef.current) {
          console.error('Map ref is not available');
          setError('לא ניתן לטעון את המפה');
          setIsLoading(false);
          return;
        }

        if (typeof window.google === 'undefined' || typeof window.google.maps === 'undefined') {
          console.error('Google Maps API is not loaded');
          setError('Google Maps לא נטען');
          setIsLoading(false);
          return;
        }

        const defaultCenter = userLat && userLng 
          ? { lat: userLat, lng: userLng }
          : { lat: 31.7683, lng: 35.2137 }; // Default to Jerusalem

        const googleMap = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });

        setMap(googleMap);
        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('שגיאה בטעינת המפה');
        setIsLoading(false);
      }
    };

    // Check if Google Maps is already loaded
    if (typeof window.google !== 'undefined' && typeof window.google.maps !== 'undefined') {
      initializeMap();
    } else {
      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]') as HTMLScriptElement;
      if (existingScript) {
        // Wait for it to load
        if (existingScript.onload) {
          initializeMap();
        } else {
          existingScript.addEventListener('load', initializeMap);
          existingScript.addEventListener('error', () => {
            setError('שגיאה בטעינת Google Maps');
            setIsLoading(false);
          });
        }
      } else {
        // Load the script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=he`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          // Small delay to ensure Google Maps is fully initialized
          setTimeout(initializeMap, 100);
        };
        
        script.onerror = () => {
          console.error('Failed to load Google Maps script');
          setError('שגיאה בטעינת Google Maps. אנא בדוק את מפתח ה-API.');
          setIsLoading(false);
        };
        
        document.head.appendChild(script);
      }
    }
  }, [userLat, userLng]);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const tasksWithLocation = tasks.filter(task => task.location_lat && task.location_lng);
    
    if (tasksWithLocation.length === 0) {
      setMarkers([]);
      return;
    }

    const newMarkers: google.maps.Marker[] = tasksWithLocation.map(task => {
      try {
        const marker = new google.maps.Marker({
          position: { lat: task.location_lat!, lng: task.location_lng! },
          map: map,
          title: task.title,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 0C9.4 0 1 8.4 1 19c0 13.5 19 31 19 31s19-17.5 19-31C39 8.4 30.6 0 20 0z" fill="#0038B8"/>
                <circle cx="20" cy="19" r="8" fill="white"/>
                <text x="20" y="24" font-size="10" font-weight="bold" text-anchor="middle" fill="#0038B8">₪${task.budget_amount}</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 50),
            anchor: new google.maps.Point(20, 50)
          }
        });

        marker.addListener('click', () => {
          onTaskClick(task.id);
        });

        return marker;
      } catch (err) {
        console.error('Error creating marker:', err);
        return null;
      }
    }).filter((marker): marker is google.maps.Marker => marker !== null);

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      try {
        const bounds = new google.maps.LatLngBounds();
        newMarkers.forEach(marker => {
          const position = marker.getPosition();
          if (position) bounds.extend(position);
        });
        map.fitBounds(bounds);
      } catch (err) {
        console.error('Error fitting bounds:', err);
      }
    }
  }, [map, tasks, onTaskClick]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col" dir="rtl">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-primary-dark">מפה</h2>
        <div className="w-10" />
      </div>
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light mx-auto mb-4"></div>
            <p className="text-gray-600">טוען מפה...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <p className="text-sm text-gray-500">אנא בדוק את הגדרות מפתח ה-API</p>
          </div>
        </div>
      ) : (
        <div ref={mapRef} className="flex-1 w-full" style={{ minHeight: 0 }} />
      )}
    </div>
  );
}
