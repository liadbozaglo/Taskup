import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import LocationAutocomplete from '../components/LocationAutocomplete';
import logoApp from '../assets/TaskUp blue.png';

interface PostTaskProps {
  onBack: () => void;
  onComplete: (taskData: TaskFormData) => void;
  initialTitle?: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  locationType: 'in-person' | 'online';
  location: string;
  locationLat: number;
  locationLng: number;
  city: string;
  budget: number;
  dueDate: string;
  category: string;
}

type DateOption = 'on-date' | 'before-date' | 'flexible';

export default function PostTask({ onBack, onComplete, initialTitle }: PostTaskProps) {
  const [step, setStep] = useState(1);
  const [dateOption, setDateOption] = useState<DateOption>('flexible');
  const [formData, setFormData] = useState<Partial<TaskFormData>>({
    locationType: 'in-person',
    title: initialTitle || '',
  });

  useEffect(() => {
    if (initialTitle) {
      setFormData(prev => ({ ...prev, title: initialTitle }));
    }
  }, [initialTitle]);

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onComplete(formData as TaskFormData);
    }
  };

  const progress = (step / 2) * 100;

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={step === 1 ? onBack : () => setStep(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <img src={logoApp} alt="Task App" className="h-10 w-auto" />
            <div className="w-10"></div>
          </div>
        </div>
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        {step === 1 && (
          <div className="max-w-2xl space-y-8" dir="rtl">
            <div>
              <h1 className="text-4xl font-bold text-primary-dark mb-4">ספר לנו מה אתה צריך</h1>
              <p className="text-xl text-secondary">תן כותרת ותאריך למשימה שלך</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-primary-dark mb-3">
                  כותרת המשימה (עד 70 תווים)
                </label>
                <input
                  type="text"
                  placeholder="לדוגמה: ניקיון סוף חוזה בדירת 3 חדרים"
                  value={formData.title || ''}
                  maxLength={70}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-light transition-colors text-lg text-right"
                />
                <p className="mt-1 text-xs text-gray-500 text-left">
                  {formData.title?.length || 0}/70
                </p>
              </div>

              <div>
                <label className="block text-lg font-semibold text-primary-dark mb-3">
                  מתי אתה צריך את זה?
                </label>
                <div className="space-y-3">
                  <button
                    onClick={() => setDateOption('on-date')}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-right ${
                      dateOption === 'on-date'
                        ? 'bg-primary-light border-primary-light text-white'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">בתאריך מסוים</div>
                  </button>

                  <button
                    onClick={() => setDateOption('before-date')}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-right ${
                      dateOption === 'before-date'
                        ? 'bg-primary-light border-primary-light text-white'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">לפני תאריך מסוים</div>
                  </button>

                  <button
                    onClick={() => setDateOption('flexible')}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-right ${
                      dateOption === 'flexible'
                        ? 'bg-primary-light border-primary-light text-white'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">אני גמיש</div>
                  </button>
                </div>

                {(dateOption === 'on-date' || dateOption === 'before-date') && (
                  <div className="mt-4">
                    <input
                      type="date"
                      value={formData.dueDate || ''}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-light transition-colors text-lg text-right"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-2xl space-y-8" dir="rtl">
            <div>
              <h1 className="text-4xl font-bold text-primary-dark mb-4">פרטים נוספים</h1>
              <p className="text-xl text-secondary">ספר לנו עוד על המשימה</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-primary-dark mb-3">
                  איך תרצה לבצע את המשימה?
                </label>
                <div className="space-y-3 mb-4">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData(prev => ({
                        ...prev,
                        locationType: 'in-person',
                      }))
                    }
                    className={`w-full p-4 rounded-xl border-2 transition-all text-right ${
                      (formData.locationType || 'in-person') === 'in-person'
                        ? 'bg-primary-light border-primary-light text-white'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">במקום (מגיעים אליך לבצע את המשימה)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData(prev => ({
                        ...prev,
                        locationType: 'online',
                        location: '',
                        locationLat: undefined,
                        locationLng: undefined,
                        city: '',
                      }))
                    }
                    className={`w-full p-4 rounded-xl b order-2 transition-all text-right ${
                      formData.locationType === 'online'
                        ? 'bg-primary-light border-primary-light text-white'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">מרחוק (אונליין)</div>
                  </button>
                </div>

                {(formData.locationType || 'in-person') === 'in-person' && (
                  <div className="mt-2">
                    <label className="block text-lg font-semibold text-primary-dark mb-3">
                      איפה תתבצע המשימה?
                    </label>
                    <LocationAutocomplete
                      value={formData.location || ''}
                      onChange={(address, lat, lng, city) =>
                        setFormData({
                          ...formData,
                          location: address,
                          locationLat: lat,
                          locationLng: lng,
                          city: city,
                        })
                      }
                      placeholder="תבחר כתובת או אזור לדוגמה: תל אביב-יפו"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-lg font-semibold text-primary-dark mb-3">
                  תיאור המשימה
                </label>
                <textarea
                  placeholder="תאר את המשימה בפירוט (לפחות 25 תווים)..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-light transition-colors text-lg resize-none text-right"
                />
                <p className="mt-1 text-xs text-gray-500 text-left">
                  {(formData.description?.length || 0) < 25
                    ? `יש לכתוב לפחות 25 תווים (כרגע ${(formData.description?.length || 0)})`
                    : `${formData.description?.length || 0} תווים`}
                </p>
              </div>

              <div>
                <label className="block text-lg font-semibold text-primary-dark mb-3">
                  קטגוריה
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-light transition-colors text-lg text-right bg-white"
                >
                  <option value="">בחר קטגוריה</option>
                  <option value="ניקיון">ניקיון</option>
                  <option value="גינון">גינון</option>
                  <option value="צביעה">צביעה</option>
                  <option value="הובלות">הובלות</option>
                  <option value="תיקונים">תיקונים</option>
                  <option value="הרכבה">הרכבה</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-semibold text-primary-dark mb-3">
                  תקציב (₪)
                </label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₪</span>
                  <input
                    type="number"
                    placeholder="200"
                    value={formData.budget || ''}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="w-full pr-12 pl-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-light transition-colors text-lg text-right"
                    min="1"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  זהו תקציב משוער בלבד – תוכלו לעדכן אותו לאחר שתראו הצעות מחיר.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleContinue}
            disabled={
              (step === 1 &&
                (!formData.title ||
                  (formData.title?.length || 0) === 0 ||
                  (formData.title?.length || 0) > 70 ||
                  ((dateOption === 'on-date' || dateOption === 'before-date') && !formData.dueDate))) ||
              (step === 2 &&
                (((formData.locationType || 'in-person') === 'in-person' &&
                  (!formData.location || !formData.locationLat || !formData.locationLng)) ||
                  !formData.description ||
                  (formData.description?.length || 0) < 25 ||
                  !formData.category ||
                  !formData.budget))
            }
            className="w-full bg-primary-light text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 1 ? 'המשך' : 'פרסם משימה'}
          </button>
        </div>
      </div>
    </div>
  );
}
