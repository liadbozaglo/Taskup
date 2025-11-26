import logoApp from '../assets/TaskUp blue.png';

interface WelcomeProps {
  onGetStarted: () => void;
}

export default function Welcome({ onGetStarted }: WelcomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center p-6">
      <div className="max-w-md w-full text-center flex flex-col min-h-screen pt-16">
        <div className="flex justify-center mb-8">
          <img src={logoApp} alt="TaskUp" className="h-20 w-auto" />
        </div>

        <div className="space-y-4 flex-grow flex flex-col justify-center" dir="rtl">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            צריכים עזרה? סגרנו את הפינה!
          </h1>
          <p className="text-base text-gray-600 leading-relaxed px-4">
            ניקיון והובלות ועד הרכבת רהיטים - מוצאים עזרה מקצועית בשניות, ובמחיר שמתאים לך.
          </p>
        </div>

        <div className="space-y-6 pb-12">
          <button
            onClick={onGetStarted}
            className="w-full bg-[#0038B8] text-white py-4 px-8 rounded-xl text-lg font-semibold hover:bg-blue-800 transition-all transform hover:scale-105 shadow-lg"
          >
            התחילו!
          </button>

          <p className="text-xs text-gray-500">
            תשלום מאובטח | קהילה אמינה | שירות מהיר
          </p>
        </div>
      </div>
    </div>
  );
}
