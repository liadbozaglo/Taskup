import { CheckCircle, Search, ClipboardList, MessageCircle, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'done' | 'browse' | 'mytasks' | 'messages' | 'account';
  onTabChange: (tab: 'done' | 'browse' | 'mytasks' | 'messages' | 'account') => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'done' as const, icon: CheckCircle, label: 'פרסום' },
    { id: 'browse' as const, icon: Search, label: 'עיון' },
    { id: 'mytasks' as const, icon: ClipboardList, label: 'המשימות שלי' },
    { id: 'messages' as const, icon: MessageCircle, label: 'הודעות' },
    { id: 'account' as const, icon: User, label: 'חשבון' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                  isActive ? 'text-primary-light' : 'text-secondary hover:text-primary-dark'
                }`}
              >
                <Icon className="w-6 h-6 mb-1 transition-all" strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-xs ${isActive ? 'font-semibold' : 'font-normal'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
