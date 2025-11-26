import { useEffect, useState } from 'react';
import { ArrowRight, MapPin, Calendar, Star, Send, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';
import logoApp from '../assets/TaskUp blue.png';

type Task = Database['public']['Tables']['tasks']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'] | null;
};

interface TaskDetailProps {
  taskId: string;
  onBack: () => void;
}

export default function TaskDetail({ taskId, onBack }: TaskDetailProps) {
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerComment, setOfferComment] = useState('');
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [questionSubmitting, setQuestionSubmitting] = useState(false);
  const [offerStep, setOfferStep] = useState<1 | 2 | 3>(1);
  const [offerError, setOfferError] = useState('');

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*, profiles!tasks_poster_id_fkey(*)')
      .eq('id', taskId)
      .maybeSingle();

    if (!error && data) {
      setTask(data);
    }
    setLoading(false);
  };

  const resetOfferFlow = () => {
    setOfferStep(1);
    setOfferAmount('');
    setOfferComment('');
    setOfferError('');
  };

  const handleSubmitOffer = async () => {
    if (!user || !task) return;

    const amountValue = Number(offerAmount);
    if (!amountValue || amountValue <= 0) {
      setOfferError('נא להזין סכום הצעה תקף');
      return;
    }

    if (offerComment.trim().length < 15) {
      setOfferError('פרטי ההצעה צריכים להכיל לפחות 15 תווים');
      return;
    }

    setSubmitting(true);

    try {
      const supabaseAny = supabase as any;
      const { data: insertedOffer, error } = await supabaseAny
        .from('offers')
        .insert({
          task_id: task.id,
          tasker_id: user.id,
          offer_amount: amountValue,
          comment: offerComment.trim(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      await supabaseAny.from('task_messages').insert({
        task_id: task.id,
        sender_id: user.id,
        recipient_id: task.poster_id,
        offer_id: insertedOffer.id,
        message_type: 'offer',
        content: offerComment.trim()
      });

      alert('ההצעה נשלחה ונוספה לשיחות שלך!');
      resetOfferFlow();
      setShowOfferForm(false);
    } catch (error) {
      console.error('Error submitting offer:', error);
      alert('שגיאה בשליחת ההצעה. נסה שוב.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !task || !question.trim()) return;

    setQuestionSubmitting(true);

    try {
      const supabaseAny = supabase as any;
      await supabaseAny.from('task_messages').insert({
        task_id: task.id,
        sender_id: user.id,
        recipient_id: task.poster_id,
        message_type: 'question',
        content: question.trim()
      });
      alert('השאלה נשלחה למפרסם ותופיע בשיחות שלך');
      setQuestion('');
      setShowQuestionForm(false);
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('שגיאה בשליחת השאלה. נסה שוב.');
    } finally {
      setQuestionSubmitting(false);
    }
  };

  const netAmount = Math.max(Number(offerAmount) || 0, 0) * 0.8;

  const handleOfferNext = () => {
    if (offerStep === 1) {
      if (!Number(offerAmount) || Number(offerAmount) <= 0) {
        setOfferError('נא להזין סכום הצעה תקף');
        return;
      }
    }

    if (offerStep === 2) {
      if (offerComment.trim().length < 15) {
        setOfferError('נדרש לפחות 15 תווים שיסבירו מה כלול בהצעה');
        return;
      }
    }

    setOfferError('');
    setOfferStep((prev) => {
      if (prev === 3) return 3;
      return (prev + 1) as 1 | 2 | 3;
    });
  };

  const handleOfferBack = () => {
    setOfferError('');
    setOfferStep((prev) => {
      if (prev === 1) return 1;
      return (prev - 1) as 1 | 2 | 3;
    });
  };

  const handleOpenOfferFlow = () => {
    resetOfferFlow();
    setShowQuestionForm(false);
    setShowOfferForm(true);
  };

  const handleOpenQuestionFlow = () => {
    setShowOfferForm(false);
    setShowQuestionForm(true);
    setQuestion('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0038B8]"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center" dir="rtl">
          <p className="text-gray-500 text-lg">המשימה לא נמצאה</p>
          <button onClick={onBack} className="mt-4 text-[#0038B8] hover:underline">
            חזור
          </button>
        </div>
      </div>
    );
  }

  const isOwnTask = user?.id === task.poster_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="w-10"></div>

            <img src={logoApp} alt="Task App" className="h-10 w-auto" />

            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8 space-y-6" dir="rtl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="inline-block bg-blue-50 text-[#0038B8] px-3 py-1 rounded-full text-sm font-medium mb-3">
                  {task.category}
                </span>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {task.title}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-[#0038B8] font-bold text-2xl">
                <span>₪</span>
                <span>{task.budget_amount}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 py-4 border-y border-gray-200">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <span>{task.location_address}</span>
              </div>

              {task.due_date && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5 flex-shrink-0" />
                  <span>עד {formatDate(task.due_date)}</span>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">תיאור המשימה</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {task.description}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">פורסם על ידי</h3>
              <div className="flex items-center gap-3">
                {task.profiles?.profile_photo ? (
                  <img
                    src={task.profiles.profile_photo}
                    alt={task.profiles.display_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#0038B8] flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {task.profiles?.display_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {task.profiles?.display_name}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>
                      {task.profiles?.average_rating ? task.profiles.average_rating.toFixed(1) : '0.0'}
                    </span>
                    <span>({task.profiles?.total_reviews || 0} ביקורות)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-200 space-y-3" dir="rtl">
            {isOwnTask ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-[#0038B8] font-medium">זו המשימה שלך</p>
                <p className="text-sm text-gray-600 mt-1">תוכל לראות הצעות שהתקבלו בעמוד "המשימות שלי"</p>
              </div>
            ) : !showOfferForm && !showQuestionForm ? (
              <>
                <button
                  onClick={handleOpenOfferFlow}
                  className="w-full bg-[#0038B8] text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  <span>הגש הצעת מחיר</span>
                </button>
                <button
                  onClick={handleOpenQuestionFlow}
                  className="w-full bg-white text-[#0038B8] border-2 border-[#0038B8] py-4 px-6 rounded-xl font-semibold hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>שאל שאלה</span>
                </button>
              </>
            ) : null}

            {showOfferForm && (
              <div className="space-y-5 border border-gray-200 rounded-2xl p-5 bg-white">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>שלב {offerStep} מתוך 3</span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map((step) => (
                      <span
                        key={step}
                        className={`h-1.5 w-10 rounded-full ${offerStep >= step ? 'bg-[#0038B8]' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>

                {offerStep === 1 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      כמה תרצה לקבל עבור המשימה? (₪)
                    </label>
                    <input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder="לדוגמה: 350"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0038B8] focus:border-transparent"
                      min="1"
                      dir="ltr"
                    />
                    <p className="text-sm text-gray-500">
                      לאחר דמי השירות של TaskUp (20%) תקבל{' '}
                      <span className="font-semibold text-gray-800">
                        ₪{netAmount.toFixed(0)}
                      </span>{' '}
                      ישירות לחשבון שלך.
                    </p>
                  </div>
                )}

                {offerStep === 2 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        מה כלול בהצעה שלך?
                      </label>
                      <span className="text-xs text-gray-400">מינימום 15 תווים</span>
                    </div>
                    <textarea
                      value={offerComment}
                      onChange={(e) => setOfferComment(e.target.value)}
                      placeholder="לדוגמה: כולל חומרי ניקוי ירוקים, הגעה עם שואב אבק וניקוי חלונות פנימי..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0038B8] focus:border-transparent resize-none"
                      rows={5}
                      minLength={15}
                    />
                    <div className="rounded-2xl bg-blue-50 border border-blue-100 p-3 text-sm text-[#0038B8]">
                      💡 טיפ: פרט את לוח הזמנים, החומרים וכל מה שכבר כלול במחיר כדי להבליט אותך.
                    </div>
                  </div>
                )}

                {offerStep === 3 && (
                  <div className="space-y-4 text-right">
                    <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50 space-y-3">
                      <div className="flex items-center justify-between text-gray-600">
                        <span>מחיר ההצעה</span>
                        <span className="text-2xl font-bold text-[#0038B8]">₪{Number(offerAmount || 0).toLocaleString('he-IL')}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>מה שיישאר עבורך לאחר דמי השירות (20%)</span>
                        <span className="font-semibold">₪{netAmount.toFixed(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">פירוט ההצעה</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {offerComment}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        אם המפרסם יאשר את ההצעה ולאחר מכן תבחר לבטל, ייתכן שיחול דמי ביטול קטנים.
                        <button
                          type="button"
                          className="text-xs text-[#0038B8] underline mr-2"
                          onClick={() => alert('פרטי דמי הביטול יתווספו בקרוב.')}
                        >
                          למד עוד
                        </button>
                      </p>
                      <p>
                        TaskUp מחזיקה את הכספים בצורה מאובטחת עד שהמשימה תושלם ותאושר.
                        <button
                          type="button"
                          className="text-xs text-[#0038B8] underline mr-2"
                          onClick={() => alert('נציג בקרוב עוד מידע על מנגנון ההגנה של התשלומים.')}
                        >
                          למידע נוסף
                        </button>
                      </p>
                    </div>
                  </div>
                )}

                {offerError && <p className="text-sm text-red-600">{offerError}</p>}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (offerStep === 1) {
                        resetOfferFlow();
                        setShowOfferForm(false);
                      } else {
                        handleOfferBack();
                      }
                    }}
                    className="flex-1 border border-gray-300 rounded-lg py-3 font-semibold hover:bg-gray-50"
                  >
                    {offerStep === 1 ? 'ביטול' : 'חזרה'}
                  </button>
                  <button
                    type="button"
                    onClick={offerStep === 3 ? handleSubmitOffer : handleOfferNext}
                    disabled={submitting}
                    className="flex-1 bg-[#0038B8] text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-all disabled:opacity-50"
                  >
                    {offerStep === 3 ? (submitting ? 'שולח...' : 'שלח הצעה') : 'המשך'}
                  </button>
                </div>
              </div>
            )}

            {showQuestionForm && (
              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    השאלה שלך למפרסם
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="מה תרצה לשאול לפני שתשלח הצעה?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0038B8] focus:border-transparent resize-none"
                    rows={4}
                    dir="rtl"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ההודעה תופיע בשיחות של שניכם ותאפשר המשך התכתבות.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={questionSubmitting || !question.trim()}
                    className="flex-1 bg-[#0038B8] text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-800 transition-all disabled:opacity-50"
                  >
                    {questionSubmitting ? 'שולח...' : 'שלח שאלה'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuestionForm(false);
                      setQuestion('');
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    ביטול
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            פורסם ב-{formatDate(task.created_at)}
          </p>
        </div>
      </main>
    </div>
  );
}
