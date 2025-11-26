import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import Welcome from './pages/Welcome';
import EmailAuth from './pages/PhoneAuth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import TaskList from './pages/TaskList';
import TaskDetail from './pages/TaskDetail';
import MyTasks from './pages/MyTasks';
import PostTask from './pages/PostTask';
import type { TaskFormData } from './pages/PostTask';
import Messages from './pages/Messages';

type AppView = 'welcome' | 'auth' | 'dashboard' | 'profile' | 'tasks' | 'taskDetail' | 'mytasks' | 'postTask' | 'messages';

function AppContent() {
  const { user, profile, loading, signUp, signIn } = useAuth();
  const [view, setView] = useState<AppView>('welcome');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [initialTaskTitle, setInitialTaskTitle] = useState<string>('');

  useEffect(() => {
    if (!user && !loading) {
      setView('welcome');
    }
  }, [user, loading]);

  const handlePostTask = async (taskData: TaskFormData) => {
    if (!user) return;

    const isOnline = taskData.locationType === 'online';

    const supabaseAny = supabase as any;
    const { error } = await supabaseAny.from('tasks').insert({
      title: taskData.title,
      description: taskData.description,
      category: taskData.category,
      location_address: isOnline ? 'אונליין' : taskData.location || 'לא צוין',
      location_lat: isOnline ? 0 : taskData.locationLat || 32.0853,
      location_lng: isOnline ? 0 : taskData.locationLng || 34.7818,
      city: isOnline ? null : taskData.city || '',
      budget_amount: taskData.budget,
      due_date: taskData.dueDate || null,
      poster_id: user.id,
      status: 'open',
    });

    if (error) {
      console.error('Error posting task:', error);
      alert('שגיאה בשמירת המשימה. נסה שוב.');
      return;
    }

    setView('mytasks');
  };

  const handleTabChange = (tab: 'done' | 'browse' | 'mytasks' | 'messages' | 'account') => {
    if (tab === 'browse') {
      setView('tasks');
    } else if (tab === 'account') {
      setView('profile');
    } else if (tab === 'mytasks') {
      setView('mytasks');
    } else if (tab === 'messages') {
      setView('messages');
    } else if (tab === 'done') {
      setView('dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0038B8]"></div>
      </div>
    );
  }

  if (user && profile) {
    if (view === 'profile') {
      return <Profile onBack={() => setView('dashboard')} onTabChange={handleTabChange} />;
    }
    if (view === 'mytasks') {
      return (
        <MyTasks
          onTabChange={handleTabChange}
          onViewTask={(taskId) => {
            setSelectedTaskId(taskId);
            setView('taskDetail');
          }}
        />
      );
    }
    if (view === 'postTask') {
      return <PostTask onBack={() => setView('dashboard')} onComplete={handlePostTask} initialTitle={initialTaskTitle} />;
    }
    if (view === 'taskDetail' && selectedTaskId) {
      return (
        <TaskDetail
          taskId={selectedTaskId}
          onBack={() => setView('tasks')}
        />
      );
    }
    if (view === 'tasks') {
      return (
        <TaskList
          onBack={() => setView('dashboard')}
          onViewTask={(taskId) => {
            setSelectedTaskId(taskId);
            setView('taskDetail');
          }}
          onTabChange={handleTabChange}
        />
      );
    }
    if (view === 'messages') {
      return <Messages onBack={() => setView('dashboard')} onTabChange={handleTabChange} />;
    }
    return (
      <Dashboard
        onNavigateToProfile={() => setView('profile')}
        onNavigateToPostTask={(title?: string) => {
          setInitialTaskTitle(title || '');
          setView('postTask');
        }}
        onTabChange={handleTabChange}
      />
    );
  }

  if (user && !profile) {
    return <Onboarding userId={user.id} onComplete={() => window.location.reload()} />;
  }

  const handleSignUp = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError('');

    try {
      await signUp(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'שגיאה בהרשמה';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError('');

    try {
      await signIn(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'שגיאה בהתחברות';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (view === 'welcome') {
    return <Welcome onGetStarted={() => setView('auth')} />;
  }

  if (view === 'auth') {
    return (
      <EmailAuth
        onSignUp={handleSignUp}
        onSignIn={handleSignIn}
        loading={authLoading}
        error={authError}
      />
    );
  }

  return null;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
