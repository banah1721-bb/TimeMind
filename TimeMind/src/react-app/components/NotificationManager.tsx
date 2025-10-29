import { useEffect, useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNotifications } from '@/react-app/hooks/useNotifications';
import { TaskType, StudySessionType, UserPreferencesType } from '@/shared/types';
import { Bell, BellOff } from 'lucide-react';

export default function NotificationManager() {
  const { user } = useAuth();
  const { settings, requestPermission, checkUpcomingTasks, checkUpcomingSessions } = useNotifications();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [sessions, setSessions] = useState<StudySessionType[]>([]);
  const [preferences, setPreferences] = useState<UserPreferencesType | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [tasksRes, sessionsRes, preferencesRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/study-sessions'),
          fetch('/api/preferences'),
        ]);

        const [tasksData, sessionsData, preferencesData] = await Promise.all([
          tasksRes.json(),
          sessionsRes.json(),
          preferencesRes.json(),
        ]);

        setTasks(tasksData);
        setSessions(sessionsData);
        setPreferences(preferencesData);

        // Show prompt if notifications are enabled in preferences but not granted in browser
        if (preferencesData.notification_enabled && settings.permission !== 'granted') {
          setShowPrompt(true);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [user, settings.permission]);

  useEffect(() => {
    if (!user || !preferences?.notification_enabled || settings.permission !== 'granted') return;

    // Check immediately
    checkUpcomingTasks(tasks);
    checkUpcomingSessions(sessions);

    // Check every minute
    const interval = setInterval(() => {
      checkUpcomingTasks(tasks);
      checkUpcomingSessions(sessions);
    }, 60000);

    return () => clearInterval(interval);
  }, [user, preferences, settings.permission, tasks, sessions, checkUpcomingTasks, checkUpcomingSessions]);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      setShowPrompt(false);
      
      // Update preferences
      try {
        await fetch('/api/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notification_enabled: true }),
        });
      } catch (error) {
        console.error('Failed to update preferences:', error);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-slide-up">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-pink-200 dark:border-blue-700 p-6 max-w-md">
        <div className="flex items-start space-x-4 space-x-reverse">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 dark:from-blue-500 dark:to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
            {settings.permission === 'granted' ? (
              <Bell className="w-6 h-6 text-white" />
            ) : (
              <BellOff className="w-6 h-6 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              تفعيل التنبيهات
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              احصل على تنبيهات فورية للمهام العاجلة والجلسات القادمة
            </p>
            
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={handleEnableNotifications}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 dark:from-blue-600 dark:to-indigo-600 text-white font-medium hover:from-pink-600 hover:to-rose-600 dark:hover:from-blue-700 dark:hover:to-indigo-700 transition-all"
              >
                تفعيل الآن
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                لاحقاً
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
