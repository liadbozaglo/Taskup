import { useEffect, useState } from 'react';
import { MapPin, Calendar, Clock, Eye, Users, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';
import BottomNav from '../components/BottomNav';
import logoApp from '../assets/TaskUp blue.png';

type Offer = Database['public']['Tables']['offers']['Row'] & {
  tasks: Database['public']['Tables']['tasks']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row'] | null;
  };
};

type PostedTask = Database['public']['Tables']['tasks']['Row'];

type TaskOffer = Database['public']['Tables']['offers']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'] | null;
};

interface MyTasksProps {
  onTabChange: (tab: 'done' | 'browse' | 'mytasks' | 'messages' | 'account') => void;
  onViewTask: (taskId: string) => void;
}

export default function MyTasks({ onTabChange, onViewTask }: MyTasksProps) {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [postedTasks, setPostedTasks] = useState<PostedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [viewMode, setViewMode] = useState<'offers' | 'posted'>('posted');
  const [selectedTaskOffers, setSelectedTaskOffers] = useState<TaskOffer[]>([]);
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState('');

  useEffect(() => {
    if (user) {
      fetchOffers();
      fetchPostedTasks();
    }
  }, [user]);

  const fetchOffers = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('offers')
      .select('*, tasks(*, profiles!tasks_poster_id_fkey(*))')
      .eq('tasker_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOffers(data as Offer[]);
    }
    setLoading(false);
  };

  const fetchPostedTasks = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('poster_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPostedTasks(data);
    }
    setLoading(false);
  };

  const fetchTaskOffers = async (taskId: string, taskTitle: string) => {
    const { data, error } = await supabase
      .from('offers')
      .select('*, profiles!offers_tasker_id_fkey(*)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSelectedTaskOffers(data as TaskOffer[]);
      setSelectedTaskTitle(taskTitle);
      setShowOffersModal(true);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    const acceptedOffer = selectedTaskOffers.find((offer) => offer.id === offerId);

    const { error } = await (supabase as any)
      .from('offers')
      .update({ status: 'accepted' })
      .eq('id', offerId);

    if (!error) {
      setSelectedTaskOffers(prev =>
        prev.map(offer =>
          offer.id === offerId ? { ...offer, status: 'accepted' } : offer
        )
      );

      if (acceptedOffer) {
        await (supabase as any)
          .from('tasks')
          .update({
            status: 'assigned',
            assigned_to: acceptedOffer.tasker_id,
          })
          .eq('id', acceptedOffer.task_id);

          alert('ההצעה אושרה! התשלום יישמר בצורה מאובטחת (סימולציה) עד לסיום המשימה.');
      }
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    const { error } = await (supabase as any)
      .from('offers')
      .update({ status: 'rejected' })
      .eq('id', offerId);

    if (!error) {
      setSelectedTaskOffers(prev =>
        prev.map(offer =>
          offer.id === offerId ? { ...offer, status: 'rejected' } : offer
        )
      );
    }
  };

  const filteredOffers = offers.filter((offer) => {
    if (filter === 'all') return true;
    return offer.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    const labels = {
      pending: 'ממתין',
      accepted: 'אושר',
      rejected: 'נדחה',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <img src={logoApp} alt="Task App" className="h-12 w-auto" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2" dir="rtl">
          <button
            onClick={() => setViewMode('posted')}
            className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              viewMode === 'posted'
                ? 'bg-[#0038B8] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            משימות שפרסמתי ({postedTasks.length})
          </button>
          <button
            onClick={() => setViewMode('offers')}
            className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              viewMode === 'offers'
                ? 'bg-[#0038B8] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            הצעות שהגשתי ({offers.length})
          </button>
        </div>

        {viewMode === 'offers' && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2" dir="rtl">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                filter === 'all'
                  ? 'bg-[#0038B8] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              הכל ({offers.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                filter === 'pending'
                  ? 'bg-[#0038B8] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              ממתין ({offers.filter(o => o.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                filter === 'accepted'
                  ? 'bg-[#0038B8] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              אושרו ({offers.filter(o => o.status === 'accepted').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                filter === 'rejected'
                  ? 'bg-[#0038B8] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              נדחו ({offers.filter(o => o.status === 'rejected').length})
            </button>
          </div>
        )}

        {viewMode === 'posted' ? (
          loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0038B8]"></div>
            </div>
          ) : postedTasks.length === 0 ? (
            <div className="text-center py-12" dir="rtl">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">עדיין לא פרסמת משימות</p>
            </div>
          ) : (
            <div className="space-y-4">
              {postedTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onViewTask(task.id)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                  dir="rtl"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {task.title}
                        </h3>
                        <span className="bg-blue-50 text-[#0038B8] px-3 py-1 rounded-full text-sm font-medium inline-block">
                          {task.category}
                        </span>
                      </div>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        פעיל
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-2">
                      {task.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm truncate">{task.location_address}</span>
                      </div>

                      {task.due_date && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">
                            {new Date(task.due_date).toLocaleDateString('he-IL')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">אין צפיות עדיין</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchTaskOffers(task.id, task.title);
                        }}
                        className="flex items-center gap-2 text-[#0038B8] font-medium hover:underline"
                      >
                        <Users className="w-5 h-5" />
                        <span>צפה בהצעות</span>
                      </button>
                      <div className="text-left">
                        <div className="flex items-center gap-1 text-[#0038B8] font-bold text-xl">
                          <span className="text-lg">₪</span>
                          <span>{task.budget_amount}</span>
                        </div>
                        <p className="text-xs text-gray-500">תקציב</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0038B8]"></div>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="text-center py-12" dir="rtl">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {filter === 'all' ? 'עדיין לא הגשת הצעות' : `אין הצעות ${filter === 'pending' ? 'ממתינות' : filter === 'accepted' ? 'מאושרות' : 'שנדחו'}`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                onClick={() => onViewTask(offer.task_id)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                dir="rtl"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {offer.tasks.title}
                      </h3>
                      <span className="bg-blue-50 text-[#0038B8] px-3 py-1 rounded-full text-sm font-medium inline-block">
                        {offer.tasks.category}
                      </span>
                    </div>
                    {getStatusBadge(offer.status)}
                  </div>

                  <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-2">
                    {offer.tasks.description}
                  </p>

                  {offer.comment && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">ההצעה שלך: </span>
                        {offer.comment}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate">{offer.tasks.location_address}</span>
                    </div>

                    {offer.tasks.due_date && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">
                          {new Date(offer.tasks.due_date).toLocaleDateString('he-IL')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      {offer.tasks.profiles?.profile_photo ? (
                        <img
                          src={offer.tasks.profiles.profile_photo}
                          alt={offer.tasks.profiles.display_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {offer.tasks.profiles?.display_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {offer.tasks.profiles?.display_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          הוגש ב-{formatDate(offer.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="text-left">
                      <div className="flex items-center gap-1 text-[#0038B8] font-bold text-xl">
                        <span className="text-lg">₪</span>
                        <span>{offer.offer_amount}</span>
                      </div>
                      <p className="text-xs text-gray-500">ההצעה שלך</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )
        )}
      </main>

      {showOffersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowOffersModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} dir="rtl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedTaskTitle}</h2>
                <button
                  onClick={() => setShowOffersModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">{selectedTaskOffers.length} הצעות התקבלו</p>
            </div>

            <div className="p-6 space-y-4">
              {selectedTaskOffers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">עדיין לא התקבלו הצעות</p>
                </div>
              ) : (
                selectedTaskOffers.map((offer) => (
                  <div key={offer.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        {offer.profiles?.profile_photo ? (
                          <img
                            src={offer.profiles.profile_photo}
                            alt={offer.profiles.display_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#0038B8] flex items-center justify-center">
                            <span className="text-white text-lg font-bold">
                              {offer.profiles?.display_name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{offer.profiles?.display_name}</p>
                          <p className="text-sm text-gray-500">
                            הוגש ב-{new Date(offer.created_at).toLocaleDateString('he-IL')}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1 text-[#0038B8] font-bold text-xl">
                          <span className="text-lg">₪</span>
                          <span>{offer.offer_amount}</span>
                        </div>
                        {offer.status === 'pending' && (
                          <p className="text-xs text-yellow-600">ממתין</p>
                        )}
                        {offer.status === 'accepted' && (
                          <p className="text-xs text-green-600">אושר</p>
                        )}
                        {offer.status === 'rejected' && (
                          <p className="text-xs text-red-600">נדחה</p>
                        )}
                      </div>
                    </div>

                    {offer.comment && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-700">{offer.comment}</p>
                      </div>
                    )}

                    {offer.status === 'pending' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Check className="w-5 h-5" />
                          <span>אשר הצעה</span>
                        </button>
                        <button
                          onClick={() => handleRejectOffer(offer.id)}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                        >
                          <X className="w-5 h-5" />
                          <span>דחה הצעה</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab="mytasks" onTabChange={onTabChange} />
    </div>
  );
}
