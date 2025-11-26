import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import logoApp from '../assets/TaskUp blue.png';

interface AuthProps {
  onSignUp: (email: string, password: string) => void;
  onSignIn: (email: string, password: string) => void;
  loading: boolean;
  error?: string;
}

export default function EmailAuth({ onSignUp, onSignIn, loading, error }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      if (password !== confirmPassword) {
        alert('הסיסמאות לא תואמות');
        return;
      }
      onSignUp(email, password);
    } else {
      onSignIn(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logoApp} alt="Task App" className="h-20 w-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'צור חשבון' : 'התחבר'}
          </h2>
          <p className="text-gray-600">
            {isSignUp ? 'הצטרף אלינו היום' : 'ברוך חזור'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-right">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-right">
              דוא"ל
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0038B8] focus:border-transparent text-right"
              required
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-right">
              סיסמה
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0038B8] focus:border-transparent text-right"
              required
              minLength={6}
              dir="ltr"
            />
            <p className="text-xs text-gray-500 text-right">לפחות 6 תווים</p>
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 text-right">
                אשר סיסמה
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0038B8] focus:border-transparent text-right"
                required
                minLength={6}
                dir="ltr"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0038B8] text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              'טוען...'
            ) : (
              <>
                <span>{isSignUp ? 'צור חשבון' : 'התחבר'}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">או</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setConfirmPassword('');
          }}
          className="w-full text-[#0038B8] font-medium hover:underline"
        >
          {isSignUp ? 'כבר יש לך חשבון? התחבר' : 'אין לך חשבון? צור חשבון'}
        </button>
      </div>
    </div>
  );
}
