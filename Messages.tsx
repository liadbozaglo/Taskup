import { useEffect, useMemo, useState } from 'react';
import { MessageCircle, ArrowRight, Send, CheckCircle2, HelpCircle, UserCircle2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type Tables = Database['public']['Tables'];
type TablesRow<T extends keyof Tables> = Tables[T]['Row'];

type Profile = TablesRow<'profiles'>;
type Task = TablesRow<'tasks'>;

interface MessagesProps {
  onTabChange: (tab: 'done' | 'browse' | 'mytasks' | 'messages' | 'account') => void;
  onBack: () => void;
}

interface ConversationSummary {
  id: string;
  task: Task;
  otherUser: Profile;
  role: 'poster' | 'tasker';
  lastMessage: string;
  lastUpdated: string;
}

type PosterOfferRow = TablesRow<'offers'> & {
  tasks: Task;
  tasker: Profile;
};

type TaskerOfferRow = TablesRow<'offers'> & {
  tasks: Task & { profiles?: Profile | null };
};

type MessageWithRelations = TablesRow<'task_messages'> & {
  task?: Task;
  sender?: Profile | null;
  recipient?: Profile | null;
};

type ThreadOffer = TablesRow<'offers'> & {
  tasker?: Profile | null;
};

const formatTimestamp = (value: string) =>
  new Date(value).toLocaleString('he-IL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

const snippet = (text: string) => (text.length > 90 ? `${text.slice(0, 87)}…` : text);

export default function Messages({ onTabChange, onBack }: MessagesProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageWithRelations[]>([]);
  const [offers, setOffers] = useState<ThreadOffer[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [offerActionId, setOfferActionId] = useState<string | null>(null);
  const [profilePreview, setProfilePreview] = useState<Profile | null>(null);

  const selectedConversation = useMemo(
    () => conversations.find((conv) => conv.id === selectedConversationId) ?? conversations[0] ?? null,
    [conversations, selectedConversationId]
  );

  useEffect(() => {
    if (!selectedConversationId && conversations.length) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    if (!user) return;
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation && user) {
      fetchConversationDetails(selectedConversation);
    } else {
      setMessages([]);
      setOffers([]);
    }
  }, [selectedConversation?.id, user]);

  const fetchConversations = async () => {
    if (!user) return;
    setLoadingConversations(true);

    try {
      const [posterOffersRes, taskerOffersRes, messagesRes] = await Promise.all([
        supabase
          .from('offers')
          .select(`
            id, task_id, offer_amount, status, comment, created_at,
            tasks!inner(*),
            tasker:profiles!offers_tasker_id_fkey(*)
          `)
          .eq('tasks.poster_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('offers')
          .select(`
            id, task_id, offer_amount, status, comment, created_at,
            tasks(*, profiles!tasks_poster_id_fkey(*)),
            tasker:profiles!offers_tasker_id_fkey(*)
          `)
          .eq('tasker_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('task_messages')
          .select(`
            id, task_id, sender_id, recipient_id, content, offer_id, message_type, created_at,
            task:tasks(*),
            sender:profiles!task_messages_sender_id_fkey(*),
            recipient:profiles!task_messages_recipient_id_fkey(*)
          `)
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
      ]);

      const map = new Map<string, ConversationSummary>();

      const registerConversation = (task: Task | null | undefined, otherUser: Profile | null | undefined, role: 'poster' | 'tasker', lastMessage: string, lastUpdated: string) => {
        if (!task || !otherUser) return;
        const id = `${task.id}-${otherUser.id}`;
        const existing = map.get(id);
        if (!existing || new Date(lastUpdated).getTime() > new Date(existing.lastUpdated).getTime()) {
          map.set(id, {
            id,
            task,
            otherUser,
            role,
            lastMessage,
            lastUpdated
          });
        }
      };

      const posterOffers = (posterOffersRes.data ?? []) as PosterOfferRow[];
      posterOffers.forEach((offer) => {
        registerConversation(
          offer.tasks,
          offer.tasker,
          'poster',
          `הצעה חדשה על ₪${Number(offer.offer_amount).toLocaleString('he-IL')}`,
          offer.created_at
        );
      });

      const taskerOffers = (taskerOffersRes.data ?? []) as TaskerOfferRow[];
      taskerOffers.forEach((offer) => {
        const posterProfile = offer.tasks.profiles;
        if (!posterProfile) return;
        registerConversation(
          offer.tasks,
          posterProfile,
          'tasker',
          `הצעה ששלחת על ₪${Number(offer.offer_amount).toLocaleString('he-IL')}`,
          offer.created_at
        );
      });

      const threadMessages = (messagesRes.data ?? []) as (MessageWithRelations & { task: Task })[];
      threadMessages.forEach((message) => {
        const task = message.task;
        const otherUser = message.sender_id === user.id ? (message.recipient as Profile | null) : (message.sender as Profile | null);
        const role = task.poster_id === user.id ? 'poster' : 'tasker';
        registerConversation(task, otherUser, role, snippet(message.content), message.created_at);
      });

      const sorted = Array.from(map.values()).sort(
        (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
      setConversations(sorted);
    } catch (error) {
      console.error('Failed to load conversations', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchConversationDetails = async (conversation: ConversationSummary) => {
    if (!user) return;
    setLoadingThread(true);
    try {
      const otherUserId = conversation.otherUser.id;
      const [{ data: threadMessages }, { data: threadOffers }] = await Promise.all([
        supabase
          .from('task_messages')
          .select(`
            id, task_id, sender_id, recipient_id, content, offer_id, message_type, created_at,
            sender:profiles!task_messages_sender_id_fkey(*),
            recipient:profiles!task_messages_recipient_id_fkey(*)
          `)
          .eq('task_id', conversation.task.id)
          .or(
            `and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`
          )
          .order('created_at', { ascending: true }),
        supabase
          .from('offers')
          .select(`
            id, task_id, offer_amount, status, comment, created_at,
            tasker:profiles!offers_tasker_id_fkey(*)
          `)
          .eq('task_id', conversation.task.id)
          .eq('tasker_id', conversation.role === 'poster' ? otherUserId : user.id)
          .order('created_at', { ascending: false })
      ]);

      setMessages((threadMessages ?? []) as MessageWithRelations[]);
      setOffers((threadOffers ?? []) as ThreadOffer[]);
    } catch (error) {
      console.error('Failed to load thread', error);
    } finally {
      setLoadingThread(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedConversation || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const supabaseAny = supabase as any;
      await supabaseAny.from('task_messages').insert({
        task_id: selectedConversation.task.id,
        sender_id: user.id,
        recipient_id: selectedConversation.otherUser.id,
        message_type: selectedConversation.role === 'poster' ? 'answer' : 'question',
        content: replyText.trim()
      });
      setReplyText('');
      await fetchConversationDetails(selectedConversation);
      await fetchConversations();
    } catch (error) {
      console.error('Failed to send reply', error);
      alert('שגיאה בשליחת ההודעה. נסה שוב.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleOfferStatusChange = async (offerId: string, status: 'accepted' | 'rejected') => {
    if (!selectedConversation) return;
    setOfferActionId(offerId);
    try {
      const supabaseAny = supabase as any;
      await supabaseAny.from('offers').update({ status }).eq('id', offerId);
      await fetchConversationDetails(selectedConversation);
      await fetchConversations();
    } catch (error) {
      console.error('Failed to update offer', error);
      alert('לא הצלחנו לעדכן את סטטוס ההצעה. נסה שוב.');
    } finally {
      setOfferActionId(null);
    }
  };

  const renderMessageBubble = (message: MessageWithRelations) => {
    const fromSelf = message.sender_id === user?.id;
    const bubbleTone = fromSelf ? 'bg-primary-light text-white rounded-bl-sm' : 'bg-gray-100 text-primary-dark rounded-br-sm';
    return (
      <div key={message.id} className={`flex ${fromSelf ? 'justify-start' : 'justify-end'}`}>
        <div className={`rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed ${bubbleTone}`}>
          {message.message_type === 'offer' && (
            <div className="flex items-center gap-2 mb-1 text-xs uppercase tracking-wide">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>הצעת מחיר</span>
            </div>
          )}
          {message.message_type === 'question' && (
            <div className="flex items-center gap-2 mb-1 text-xs uppercase tracking-wide">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>שאלה</span>
            </div>
          )}
          {message.message_type === 'answer' && (
            <div className="flex items-center gap-2 mb-1 text-xs uppercase tracking-wide">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>תשובה</span>
            </div>
          )}
          <p>{message.content}</p>
          <span className="block text-xs mt-2 opacity-70 text-right">{formatTimestamp(message.created_at)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-primary-light text-white rounded-b-3xl shadow-md">
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between" dir="rtl">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              <span>חזרה</span>
            </button>
            <div className="text-right">
              <p className="text-white/80 text-sm">שיחות בין מזמיני ומשלימי משימות</p>
              <h1 className="text-2xl font-bold">הודעות</h1>
            </div>
            <div className="w-10" />
          </div>
        </header>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-primary-dark">השיחות שלך</h2>
          </div>

          {loadingConversations ? (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-500">טוען שיחות...</div>
          ) : conversations.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-500">
              עדיין אין שיחות. שלח הצעה או שאלה ממשימתך הראשונה כדי להתחיל שיחה.
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => {
                const isActive = selectedConversation?.id === conversation.id;
                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`w-full text-right rounded-2xl border p-4 transition-all ${
                      isActive ? 'border-primary-light bg-primary-light/10' : 'border-gray-200 bg-white hover:border-primary-light'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm text-secondary">{conversation.task.title}</p>
                        <h3 className="text-base font-semibold text-primary-dark">{conversation.otherUser.display_name}</h3>
                      </div>
                      <div className="text-xs text-secondary flex flex-col items-end gap-1">
                        <span>{formatTimestamp(conversation.lastUpdated)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-secondary line-clamp-2">{conversation.lastMessage}</p>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {selectedConversation && (
          <section className="bg-white rounded-3xl shadow-sm p-6 space-y-6 border border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-secondary">משימה</p>
                <h3 className="text-lg font-semibold text-primary-dark">{selectedConversation.task.title}</h3>
              </div>
              <div className="flex items-center gap-2 text-primary-light text-sm">
                <MessageCircle className="w-4 h-4" />
                <span>{selectedConversation.otherUser.display_name}</span>
                <button
                  type="button"
                  onClick={() => setProfilePreview(selectedConversation.otherUser)}
                  className="text-xs underline"
                >
                  פרטי פרופיל
                </button>
              </div>
            </div>

            {loadingThread ? (
              <div className="text-center text-gray-500 py-8">טוען שיחה...</div>
            ) : (
              <>
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 border border-dashed border-gray-300 rounded-2xl py-6">
                      עדיין אין הודעות. פתח את השיחה עם שאלה או פרטי הצעה.
                    </div>
                  ) : (
                    messages.map(renderMessageBubble)
                  )}
                </div>

                {offers.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-800">הצעות שנשלחו</h4>
                    {offers.map((offer) => (
                      <div key={offer.id} className="border border-gray-200 rounded-2xl p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-xs text-gray-500">₪{Number(offer.offer_amount).toLocaleString('he-IL')}</p>
                            <p className="text-sm text-gray-600">{formatTimestamp(offer.created_at)}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              offer.status === 'pending'
                                ? 'bg-yellow-50 text-yellow-700'
                                : offer.status === 'accepted'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {offer.status === 'pending' ? 'ממתין' : offer.status === 'accepted' ? 'אושר' : 'נדחה'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{offer.comment}</p>
                        {selectedConversation.role === 'poster' && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setProfilePreview(offer.tasker ?? selectedConversation.otherUser)}
                              className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50"
                            >
                              צפה בפרופיל
                            </button>
                            {offer.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOfferStatusChange(offer.id, 'accepted')}
                                  disabled={offerActionId === offer.id}
                                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                                >
                                  {offerActionId === offer.id ? 'מאשר...' : 'אשר הצעה'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOfferStatusChange(offer.id, 'rejected')}
                                  disabled={offerActionId === offer.id}
                                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
                                >
                                  דחה
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <form className="flex items-center gap-3" onSubmit={handleSendReply}>
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="כתוב הודעה..."
                    className="flex-1 border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="bg-primary-light text-white rounded-full p-3 hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </>
            )}
          </section>
        )}
      </main>

      {profilePreview && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-4" onClick={() => setProfilePreview(null)}>
          <div
            className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 space-y-4"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">פרטי פרופיל</h3>
              <button onClick={() => setProfilePreview(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="flex items-center gap-3">
              {profilePreview.profile_photo ? (
                <img src={profilePreview.profile_photo} alt={profilePreview.display_name} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-100 text-primary-light flex items-center justify-center">
                  <UserCircle2 className="w-8 h-8" />
                </div>
              )}
              <div>
                <p className="text-xl font-bold text-gray-900">{profilePreview.display_name}</p>
                <p className="text-sm text-gray-500">{profilePreview.city || 'ישראל'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">דירוג</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profilePreview.average_rating?.toFixed(1) ?? '0.0'}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">ביקורות</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profilePreview.total_reviews ?? 0}
                </p>
              </div>
            </div>
            {profilePreview.bio && (
              <p className="text-sm text-gray-700 whitespace-pre-line">{profilePreview.bio}</p>
            )}
          </div>
        </div>
      )}

      <BottomNav activeTab="messages" onTabChange={onTabChange} />
    </div>
  );
}

