import { useEffect, useState } from 'react';
import { MapPin, Calendar, Search, Filter, Clock, ChevronDown, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import BottomNav from '../components/BottomNav';
import TaskFilters, { FilterState } from '../components/TaskFilters';
import TaskMapView from '../components/TaskMapView';
import { calculateDistance, formatDistance } from '../lib/distance';
import { useAuth } from '../contexts/AuthContext';

type Task = Database['public']['Tables']['tasks']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'] | null;
  offerCount?: number;
};

interface TaskListProps {
  onBack: () => void;
  onViewTask: (taskId: string) => void;
  onTabChange: (tab: 'done' | 'browse' | 'mytasks' | 'messages' | 'account') => void;
}

type SortOption = 'recommended' | 'recent' | 'due-soon' | 'closest' | 'lowest-price' | 'highest-price';

export default function TaskList({ onViewTask, onTabChange }: TaskListProps) {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [filters, setFilters] = useState<FilterState>({
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
  });

  useEffect(() => {
    if (profile?.location_lat && profile?.location_lng) {
      setFilters(prev => ({
        ...prev,
        locationLat: profile.location_lat,
        locationLng: profile.location_lng,
        location: profile.location_address || '',
        city: profile.city || ''
      }));
    }
  }, [profile]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*, profiles!tasks_poster_id_fkey(*)')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const tasksWithOffers: Task[] = await Promise.all(
        (data as any[]).map(async (taskData: any) => {
          const { count } = await supabase
            .from('offers')
            .select('*', { count: 'exact', head: true })
            .eq('task_id', taskData.id);

          const task: Task = {
            ...taskData,
            offerCount: count || 0
          };
          return task;
        })
      );
      setTasks(tasksWithOffers);
    }
    setLoading(false);
  };

  const filteredAndSortedTasks = () => {
    let filtered = tasks.filter((task) => {
      // Category filter
      if (filters.selectedCategories.length > 0) {
        if (!filters.selectedCategories.includes(task.category)) {
          return false;
        }
      }

      // Task type filter (in-person vs remote) - for now we'll skip this as it's not in our schema
      // You can add a field to tasks table later if needed

      // Location filter
      if (filters.location && filters.locationLat && filters.locationLng) {
        if (task.location_lat && task.location_lng) {
          const distance = calculateDistance(
            filters.locationLat,
            filters.locationLng,
            task.location_lat,
            task.location_lng
          );
          if (distance > filters.distance) {
            return false;
          }
        }
      }

      // Price filter
      if (Number(task.budget_amount) < filters.priceRange[0] || Number(task.budget_amount) > filters.priceRange[1]) {
        return false;
      }

      // Available only
      if (filters.availableOnly && task.status !== 'open') {
        return false;
      }

      // No offers only
      if (filters.noOffersOnly) {
        const offerCount = task.offerCount || 0;
        if (offerCount > 0) {
          return false;
        }
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'due-soon':
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'lowest-price':
          return Number(a.budget_amount) - Number(b.budget_amount);
        case 'highest-price':
          return Number(b.budget_amount) - Number(a.budget_amount);
        case 'closest':
          if (!filters.locationLat || !filters.locationLng) return 0;
          const distA = calculateDistance(filters.locationLat, filters.locationLng, a.location_lat, a.location_lng);
          const distB = calculateDistance(filters.locationLat, filters.locationLng, b.location_lat, b.location_lng);
          return distA - distB;
        case 'recommended':
        default:
          return 0;
      }
    });

    return filtered;
  };

  const displayedTasks = filteredAndSortedTasks();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (showMapView) {
    return (
      <TaskMapView
        tasks={displayedTasks}
        onClose={() => setShowMapView(false)}
        onTaskClick={onViewTask}
        userLat={filters.locationLat}
        userLng={filters.locationLng}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Filters Modal */}
      <TaskFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={(newFilters) => setFilters(newFilters)}
        initialFilters={filters}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16" dir="rtl">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button 
                onClick={() => setShowMapView(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MapPin className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            <h1 className="text-xl font-bold text-gray-900">עיון במשימות</h1>

            <div className="w-10"></div>
          </div>

          {/* Filter and Sort Row */}
          <div className="flex items-center justify-between pb-3" dir="rtl">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-primary-light bg-primary-light/10 text-primary-light font-semibold hover:bg-primary-light/20 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>סינון</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="font-medium">מיון</span>
                <ChevronDown className="w-4 h-4 text-primary-light" />
              </button>
              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg min-w-[200px] z-30">
                  <button
                    onClick={() => { setSortBy('recommended'); setShowSortDropdown(false); }}
                    className={`w-full px-4 py-2 text-right hover:bg-gray-100 ${sortBy === 'recommended' ? 'bg-blue-50 text-primary-light font-semibold' : ''}`}
                  >
                    מומלץ
                  </button>
                  <button
                    onClick={() => { setSortBy('recent'); setShowSortDropdown(false); }}
                    className={`w-full px-4 py-2 text-right hover:bg-gray-100 ${sortBy === 'recent' ? 'bg-blue-50 text-primary-light font-semibold' : ''}`}
                  >
                    פורסם לאחרונה
                  </button>
                  <button
                    onClick={() => { setSortBy('due-soon'); setShowSortDropdown(false); }}
                    className={`w-full px-4 py-2 text-right hover:bg-gray-100 ${sortBy === 'due-soon' ? 'bg-blue-50 text-primary-light font-semibold' : ''}`}
                  >
                    מסתיים בקרוב
                  </button>
                  <button
                    onClick={() => { setSortBy('closest'); setShowSortDropdown(false); }}
                    className={`w-full px-4 py-2 text-right hover:bg-gray-100 ${sortBy === 'closest' ? 'bg-blue-50 text-primary-light font-semibold' : ''}`}
                  >
                    הכי קרוב אלי
                  </button>
                  <button
                    onClick={() => { setSortBy('lowest-price'); setShowSortDropdown(false); }}
                    className={`w-full px-4 py-2 text-right hover:bg-gray-100 ${sortBy === 'lowest-price' ? 'bg-blue-50 text-primary-light font-semibold' : ''}`}
                  >
                    מחיר נמוך
                  </button>
                  <button
                    onClick={() => { setSortBy('highest-price'); setShowSortDropdown(false); }}
                    className={`w-full px-4 py-2 text-right hover:bg-gray-100 ${sortBy === 'highest-price' ? 'bg-blue-50 text-primary-light font-semibold' : ''}`}
                  >
                    מחיר גבוה
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light"></div>
          </div>
        ) : displayedTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">לא נמצאו משימות</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onViewTask(task.id)}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer"
                dir="rtl"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <span className="inline-block bg-blue-50 text-primary-light px-3 py-1 rounded-full text-sm font-medium mb-2">
                      {task.category}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {task.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2">
                      {task.description}
                    </p>
                  </div>

                  <div className="text-left">
                    <div className="flex items-center gap-1 text-primary-light font-bold text-2xl">
                      <span className="text-xl">₪</span>
                      <span>{task.budget_amount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{task.city || task.location_address}</span>
                  </div>

                  {filters.locationLat && filters.locationLng && task.location_lat && task.location_lng && (
                    <div className="flex items-center gap-1 text-primary-light font-semibold">
                      <span>{formatDistance(calculateDistance(filters.locationLat, filters.locationLng, task.location_lat, task.location_lng))} ממך</span>
                    </div>
                  )}

                  {task.due_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>עד {formatDate(task.due_date)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(task.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    {task.profiles?.profile_photo ? (
                      <img
                        src={task.profiles.profile_photo}
                        alt={task.profiles.display_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {task.profiles?.display_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {task.profiles?.display_name}
                    </span>
                  </div>

                  {task.offerCount && task.offerCount > 0 && (
                    <div className="text-sm text-gray-500">
                      {task.offerCount} הצעות
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav activeTab="browse" onTabChange={onTabChange} />
    </div>
  );
}
