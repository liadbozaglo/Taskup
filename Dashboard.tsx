import { useAuth } from '../contexts/AuthContext';
import {
  Bell,
  Wrench,
  Paintbrush,
  Truck,
  Home,
  FileText,
  Laptop,
  Hammer,
  Wind,
  Sparkles,
  Wine,
  Dog,
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useState } from 'react';
import logoApp from '../assets/TaskUp.png';

interface DashboardProps {
  onNavigateToProfile: () => void;
  onNavigateToPostTask: (title?: string) => void;
  onTabChange: (tab: 'done' | 'browse' | 'mytasks' | 'messages' | 'account') => void;
}

export default function Dashboard({ onNavigateToProfile, onNavigateToPostTask, onTabChange }: DashboardProps) {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'Gardening', icon: Home, nameHe: 'גינון' },
    { name: 'Painting', icon: Paintbrush, nameHe: 'צביעה' },
    { name: 'Cleaning', icon: Wind, nameHe: 'ניקיון' },
    { name: 'Removals', icon: Truck, nameHe: 'הובלות' },
    { name: 'Repairs', icon: Wrench, nameHe: 'תיקונים' },
    { name: 'Copywriting', icon: FileText, nameHe: 'כתיבה' },
    { name: 'Data Entry', icon: Laptop, nameHe: 'הזנת מידע' },
    { name: 'Assembly', icon: Hammer, nameHe: 'הרכבה' },
  ];

  const quickSuggestions = [
    { label: 'עזרו לי לעבור דירה', icon: Truck },
    { label: 'נקיון דירה לאחר חוזה', icon: Sparkles },
    { label: 'ברמן למסיבה פרטית', icon: Wine },
    { label: 'תוציאו את הכלב שלי לטיול', icon: Dog },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'בוקר טוב';
    if (hour < 18) return 'צהריים טובים';
    return 'ערב טוב';
  };

  return (
    <div className="min-h-screen bg-white pb-16">
      <div className="bg-primary-light relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>

        <header className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <img src={logoApp} alt="Task App" className="h-14 w-auto" />
              <button
                onClick={onNavigateToProfile}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <Bell className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </header>

        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-8">
          <div className="space-y-6">
            <div dir="rtl">
              <p className="text-white text-lg mb-2">{getGreeting()}, {profile?.display_name}</p>
              <h2 className="text-white text-4xl font-bold leading-tight">
                יש לך משימה? סגור את הפינה.
              </h2>
            </div>

            <div className="space-y-3" dir="rtl">
              <input
                type="text"
                placeholder="במה אתה צריך עזרה?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    onNavigateToPostTask(searchQuery);
                  }
                }}
                className="w-full px-6 py-4 rounded-xl text-lg focus:outline-none focus:ring-4 focus:ring-white/20 transition-all text-right"
              />

              <button
                onClick={() => onNavigateToPostTask(searchQuery)}
                className="w-full bg-primary-dark text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <span>קבל הצעות</span>
                <span>←</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 justify-start" dir="rtl">
              {quickSuggestions.map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                <button
                    key={index}
                    onClick={() => onNavigateToPostTask(suggestion.label)}
                    className="flex flex-row-reverse items-center gap-2 px-4 py-2 rounded-full border-2 border-white text-white whitespace-nowrap hover:bg-white hover:text-primary-light transition-all font-medium"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{suggestion.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8" dir="rtl">
          <h3 className="text-2xl font-bold text-primary-dark mb-2">צריך שמשהו יתבצע?</h3>
          <p className="text-secondary">עיין בקטגוריות הפופולריות שלנו</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <button
                key={index}
                onClick={() => onNavigateToPostTask(category.nameHe)}
                className="bg-secondary-light p-6 rounded-2xl hover:shadow-lg transition-all group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-primary-dark rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-primary-dark font-semibold text-center">{category.nameHe}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl" dir="rtl">
        <div className="text-center space-y-6">
          <h3 className="text-3xl font-bold text-primary-dark">לא מצאת את מה שאתה צריך?</h3>
          <p className="text-secondary text-lg">פרסם משימה וקבל הצעות ממומחים מקומיים</p>
          <button
            onClick={() => onNavigateToPostTask()}
            className="bg-primary-light text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all inline-flex items-center gap-3"
          >
            <span>פרסם משימה וקבל הצעות</span>
            <span>→</span>
          </button>
        </div>
      </section>

      <BottomNav activeTab="done" onTabChange={onTabChange} />
    </div>
  );
}
