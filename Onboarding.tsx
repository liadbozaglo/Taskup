import { useState } from 'react';
import { Camera, Briefcase, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LocationAutocomplete from '../components/LocationAutocomplete';
import logoApp from '../assets/TaskUp blue.png';

interface OnboardingProps {
  userId: string;
  onComplete: () => void;
}

export default function Onboarding({ userId, onComplete }: OnboardingProps) {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState<'poster' | 'tasker' | 'both'>('both');
  const [location, setLocation] = useState('');
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabaseAny = supabase as any;
      const { error: profileError } = await supabaseAny
        .from('profiles')
        .insert({
          id: userId,
          display_name: displayName,
          bio: bio,
          role: role,
          location_address: location || null,
          location_lat: locationLat,
          location_lng: locationLng,
          city: city || null,
        });

      if (profileError) throw profileError;

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירת הפרופיל');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logoApp} alt="Task App" className="h-20 w-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">ברוך הבא ל-Taskup</h2>
          <p className="text-gray-600">בוא נבין מי אתה ומה אתה רוצה לעשות בפלטפורמה</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Region (fixed to Israel for now) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 text-right">
              אזור השירות שלך
            </label>
            <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0038B8]" />
                <span className="font-semibold text-[#0038B8]">ישראל</span>
              </div>
              <span className="text-xs text-gray-500">אנחנו נרחיב מדינות בהמשך</span>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              className="relative w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors group"
            >
              <Camera className="w-8 h-8 text-gray-400 group-hover:text-gray-600" />
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-300"></div>
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            אם תרצה להרוויח כסף ב-Taskup, מומלץ להעלות תמונת פרופיל ברורה כדי שמזמיני משימות יכירו אותך טוב יותר.
          </p>

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-right">
              שם מלא *
            </label>
            <input
              id="name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="איך לקרוא לך?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0038B8] focus:border-transparent text-right"
              required
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 text-right">
              ספר על עצמך (מומלץ במיוחד למי שרוצה להרוויח כסף)
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="ספר לנו קצת על עצמך..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0038B8] focus:border-transparent text-right resize-none"
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 text-right">
              שכונת מגורים / אזור פעילות
            </label>
            <LocationAutocomplete
              value={location}
              onChange={(address, lat, lng, cityName) => {
                setLocation(address);
                setLocationLat(lat);
                setLocationLng(lng);
                setCity(cityName);
              }}
              placeholder="לדוגמה: תל אביב - מרכז העיר"
            />
            <p className="text-xs text-gray-500 text-right">זה יעזור לנו להציע לך משימות קרובות</p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 text-right">
              מה המטרה המרכזית שלך ב-Taskup? *
            </label>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setRole('tasker')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  role === 'tasker'
                    ? 'border-[#0038B8] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${role === 'tasker' ? 'bg-[#0038B8]' : 'bg-gray-100'}`}>
                    <span className={`text-lg font-semibold ${role === 'tasker' ? 'text-white' : 'text-gray-600'}`}>₪</span>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-semibold text-gray-900">אני רוצה להרוויח כסף (להיות טאסקֶר)</p>
                    <p className="text-sm text-gray-600">
                      תיצור פרופיל מקצועי, תעיין במשימות ותשלח הצעות מחיר למי שמחפש עזרה.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('poster')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  role === 'poster'
                    ? 'border-[#0038B8] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${role === 'poster' ? 'bg-[#0038B8]' : 'bg-gray-100'}`}>
                    <Briefcase className={`w-5 h-5 ${role === 'poster' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-semibold text-gray-900">אני רוצה לפרסם משימות ולקבל עזרה</p>
                    <p className="text-sm text-gray-600">
                      תפרסם משימות, תגדיר תקציב ולוחות זמנים ותבחר את מי שיבצע עבורך.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('both')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  role === 'both'
                    ? 'border-[#0038B8] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${role === 'both' ? 'bg-[#0038B8]' : 'bg-gray-100'}`}>
                    <div className="flex gap-1 items-center">
                      <span className={`text-base font-semibold ${role === 'both' ? 'text-white' : 'text-gray-600'}`}>₪</span>
                      <Briefcase className={`w-4 h-4 ${role === 'both' ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-semibold text-gray-900">גם להרוויח וגם לקבל עזרה</p>
                    <p className="text-sm text-gray-600">
                      תוכל גם לפרסם משימות וגם להגיש הצעות, לפי מה שמתאים לך בכל רגע.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-right">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !displayName}
            className="w-full bg-[#0038B8] text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'שומר...' : 'בוא נתחיל!'}
          </button>
        </form>
      </div>
    </div>
  );
}
