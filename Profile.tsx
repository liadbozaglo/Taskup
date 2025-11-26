import { useAuth } from '../contexts/AuthContext';
import { Bell, Camera, Pencil, CreditCard, BellRing, Lock, BarChart3, ClipboardList, HelpCircle, Users, MessageSquare, Shield, FileText, LogOut, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useState } from 'react';
import BottomNav from '../components/BottomNav';
import logoApp from '../assets/TaskUp blue.png';

interface ProfileProps {
  onBack: () => void;
  onTabChange: (tab: 'done' | 'browse' | 'mytasks' | 'messages' | 'account') => void;
}

export default function Profile({ onBack, onTabChange }: ProfileProps) {
  const { profile, signOut } = useAuth();
  const [uploading, setUploading] = useState(false);

  if (!profile) return null;

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('אנא בחר קובץ תמונה');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('התמונה גדולה מדי. מקסימום 5MB');
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ profile_photo: base64Image })
          .eq('id', profile.id);

        if (updateError) throw updateError;

        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('שגיאה בהעלאת התמונה. נסה שוב.');
      setUploading(false);
    }
  };

  const menuItems = [
    {
      title: 'הגדרות חשבון',
      items: [
        { icon: CreditCard, label: 'אפשרויות תשלום', action: () => {} },
        { icon: BellRing, label: 'העדפות התראות', action: () => {} },
        { icon: Lock, label: 'מידע אישי', action: () => {} },
      ],
    },
    {
      title: 'הרווחת כסף',
      items: [
        { icon: BarChart3, label: 'לוח הבקרה שלי', action: () => {} },
        {
          icon: ClipboardList,
          label: 'התראות משימות',
          subtitle: 'קבל התראות כאשר משימות חדשות תואמות את המיומנויות שלך',
          action: () => {}
        },
      ],
    },
    {
      title: 'עזרה ותמיכה',
      items: [
        { icon: HelpCircle, label: 'שאלות נפוצות', action: () => {} },
        { icon: Users, label: 'הנחיות קהילה', action: () => {} },
        { icon: MessageSquare, label: 'צור קשר', action: () => {} },
      ],
    },
    {
      title: 'בטיחות',
      items: [
        { icon: Shield, label: 'הגנת ביטוח', action: () => {} },
        { icon: FileText, label: 'משפטי', action: () => {} },
      ],
    },
  ];

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
              <img src={logoApp} alt="Task App" className="h-12 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors relative">
                <Bell className="w-6 h-6 text-white" />
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
              </button>
            </div>
          </div>
        </header>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-4">
          <div className="flex items-start gap-4" dir="rtl">
            <div className="relative">
              {profile.profile_photo ? (
                <img
                  src={profile.profile_photo}
                  alt={profile.display_name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-primary-light text-2xl font-bold">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <label
                htmlFor="profile-photo"
                className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-lg hover:bg-gray-100 cursor-pointer"
              >
                {uploading ? (
                  <div className="w-3 h-3 border-2 border-primary-light border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-3 h-3 text-gray-600" />
                )}
              </label>
              <input
                id="profile-photo"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-1">{profile.display_name}</h1>
              <p className="text-white/90 text-lg">{profile.location_address || 'ישראל'}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6" dir="rtl">
            <button className="flex-1 bg-white text-primary-dark py-3 px-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              צפה בפרופיל הציבורי שלך
            </button>
            <button className="bg-white/20 text-white p-3 rounded-xl hover:bg-white/30 transition-colors">
              <Pencil className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" dir="rtl">
        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-8">
            <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-4 px-4">
              {section.title}
            </h2>
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIndex}
                    onClick={item.action}
                    className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors rounded-xl group"
                  >
                    <div className="flex items-center gap-4">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <div className="text-right">
                        <div className="font-medium text-primary-dark">{item.label}</div>
                        {item.subtitle && (
                          <div className="text-sm text-secondary mt-0.5">{item.subtitle}</div>
                        )}
                      </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="px-4 pt-4 pb-8">
          <button
            onClick={() => {
              sessionStorage.removeItem('hasSeenSplash');
              signOut();
            }}
            className="flex items-center gap-3 text-primary-light font-semibold hover:text-primary-dark transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>התנתק</span>
          </button>
        </div>
      </main>

      <BottomNav activeTab="account" onTabChange={onTabChange} />
    </div>
  );
}
