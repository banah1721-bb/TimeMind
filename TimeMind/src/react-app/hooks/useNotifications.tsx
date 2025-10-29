import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { TaskType, StudySessionType } from '@/shared/types';

interface NotificationSettings {
  enabled: boolean;
  permission: NotificationPermission;
}

export function useNotifications() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    permission: 'default',
  });

  useEffect(() => {
    if ('Notification' in window) {
      setSettings(prev => ({
        ...prev,
        permission: Notification.permission,
      }));
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('المتصفح لا يدعم التنبيهات');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setSettings(prev => ({
        ...prev,
        permission,
        enabled: permission === 'granted',
      }));
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, []);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!user || settings.permission !== 'granted') return;

    try {
      const notification = new Notification(title, {
        icon: '/icon.png',
        badge: '/badge.png',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Play notification sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiY3PLHdSgGKHzM8dyTQAsXZLnr8Z5SDAsMRZXf8rB7JgQ+leLyxnUpBSJ0w+/dmkELEF243PSiYhoQOY/Y88t2LAYocsjw3JZBChVYqujrsVsXDkib2/G8aiYGMYvV8sZ6LQUrc8Tv35pBCRRisOv0pGMaEjmP2fPMezAFKHfJ8N2MQwsWXqni7bVlGxBBl9z0wXYnBjGJ0/LIdioGKXPD7+KeRgkUY7Ps8qhlGw83j9f0ynswBSp8x+/dkEQKFl+s5O+zYhoSPZfZ9cF3Jwc0i9Tz');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }, [user, settings.permission]);

  const checkUpcomingTasks = useCallback((tasks: TaskType[]) => {
    if (!user || settings.permission !== 'granted') return;

    const now = new Date();
    
    tasks.forEach(task => {
      if (task.is_completed || !task.deadline_at) return;

      const deadline = new Date(task.deadline_at);
      const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Notify 24 hours before
      if (hoursUntilDeadline <= 24 && hoursUntilDeadline > 23) {
        sendNotification('⏰ تذكير بموعد قريب', {
          body: `${task.title}\nيتبقى 24 ساعة على الموعد النهائي`,
          tag: `task-24h-${task.id}`,
          requireInteraction: true,
        });
      }

      // Notify 1 hour before
      if (hoursUntilDeadline <= 1 && hoursUntilDeadline > 0.9) {
        sendNotification('🚨 تنبيه عاجل!', {
          body: `${task.title}\nيتبقى ساعة واحدة على الموعد النهائي`,
          tag: `task-1h-${task.id}`,
          requireInteraction: true,
        });
      }

      // Notify when overdue
      if (hoursUntilDeadline < 0 && hoursUntilDeadline > -1) {
        sendNotification('❌ انتهى الموعد النهائي', {
          body: `${task.title}\nتجاوزت الموعد النهائي المحدد`,
          tag: `task-overdue-${task.id}`,
          requireInteraction: true,
        });
      }
    });
  }, [user, settings.permission, sendNotification]);

  const checkUpcomingSessions = useCallback((sessions: StudySessionType[]) => {
    if (!user || settings.permission !== 'granted') return;

    const now = new Date();
    
    sessions.forEach(session => {
      if (session.is_completed) return;

      const sessionStart = new Date(session.scheduled_start_at);
      const minutesUntilSession = (sessionStart.getTime() - now.getTime()) / (1000 * 60);

      // Notify 15 minutes before
      if (minutesUntilSession <= 15 && minutesUntilSession > 14) {
        sendNotification('📚 جلسة دراسة قريبة', {
          body: `${session.task_title || 'جلسة دراسة'}\nتبدأ خلال 15 دقيقة`,
          tag: `session-15m-${session.id}`,
          requireInteraction: false,
        });
      }

      // Notify 5 minutes before
      if (minutesUntilSession <= 5 && minutesUntilSession > 4) {
        sendNotification('⏰ وقت الاستعداد!', {
          body: `${session.task_title || 'جلسة دراسة'}\nتبدأ خلال 5 دقائق`,
          tag: `session-5m-${session.id}`,
          requireInteraction: true,
        });
      }

      // Notify at session start
      if (minutesUntilSession <= 0 && minutesUntilSession > -1) {
        sendNotification('🎯 وقت البدء الآن!', {
          body: `${session.task_title || 'جلسة دراسة'}\nحان وقت بدء الجلسة`,
          tag: `session-start-${session.id}`,
          requireInteraction: true,
        });
      }
    });
  }, [user, settings.permission, sendNotification]);

  return {
    settings,
    requestPermission,
    sendNotification,
    checkUpcomingTasks,
    checkUpcomingSessions,
  };
}
