import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import Layout from "@/react-app/components/Layout";
import { useLanguage } from "@/react-app/hooks/useLanguage";
import { TaskType, StudySessionType, UserPreferencesType } from "@/shared/types";
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Brain, 
  Plus, 
  Trash2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { ar, enUS } from "date-fns/locale";

export default function Schedule() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [sessions, setSessions] = useState<StudySessionType[]>([]);
  const [preferences, setPreferences] = useState<UserPreferencesType | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedDate] = useState(new Date());

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [tasksRes, sessionsRes, prefsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/study-sessions"),
        fetch("/api/preferences"),
      ]);

      const [tasksData, sessionsData, prefsData] = await Promise.all([
        tasksRes.json(),
        sessionsRes.json(),
        prefsRes.json(),
      ]);

      setTasks(tasksData.filter((t: TaskType) => !t.is_completed));
      setSessions(sessionsData);
      setPreferences(prefsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAISuggestions = async () => {
    if (!preferences) return;
    
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/suggest-study-times", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: tasks.map(t => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            estimated_duration: t.estimated_duration || 60,
            deadline_at: t.deadline_at,
            subject: t.subject,
          })),
          existing_sessions: sessions.map(s => ({
            scheduled_start_at: s.scheduled_start_at,
            scheduled_end_at: s.scheduled_end_at,
          })),
          preferences: {
            preferred_study_start_time: preferences.preferred_study_start_time,
            preferred_study_end_time: preferences.preferred_study_end_time,
            break_duration: preferences.break_duration,
            max_session_duration: preferences.max_session_duration,
          },
        }),
      });

      const data = await response.json();
      
      if (data.sessions && Array.isArray(data.sessions)) {
        // Create sessions from AI suggestions
        for (const suggestion of data.sessions) {
          const createResponse = await fetch("/api/study-sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              task_id: suggestion.task_id,
              scheduled_start_at: suggestion.scheduled_start_at,
              scheduled_end_at: suggestion.scheduled_end_at,
              ai_suggested: true,
            }),
          });
          
          if (createResponse.ok) {
            const newSession = await createResponse.json();
            setSessions(prev => [...prev, newSession]);
          }
        }
      }
    } catch (error) {
      console.error("Failed to generate AI suggestions:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const deleteSession = async (sessionId: number) => {
    try {
      await fetch(`/api/study-sessions/${sessionId}`, { method: "DELETE" });
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(selectedDate, { weekStartsOn: 0 }), i);
    return date;
  });

  const getSessionsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return sessions.filter(s => s.scheduled_start_at.startsWith(dateStr));
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  if (isPending || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Clock className="w-8 h-8 animate-spin text-pink-600 dark:text-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {t('schedule.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {language === 'ar' 
                ? 'نظم جدول دراستك بذكاء مع الذكاء الاصطناعي' 
                : 'Organize your study schedule smartly with AI'}
            </p>
          </div>
          
          <button
            onClick={generateAISuggestions}
            disabled={aiLoading || tasks.length === 0}
            className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-600 dark:to-indigo-600 text-white font-medium hover:from-purple-600 hover:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiLoading ? (
              <>
                <Clock className="w-5 h-5 ml-2 animate-spin" />
                {language === 'ar' ? 'جاري التوليد...' : 'Generating...'}
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 ml-2" />
                {language === 'ar' ? 'اقتراحات ذكية' : 'AI Suggestions'}
              </>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'إجمالي الجلسات' : 'Total Sessions'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{sessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'جلسات مكتملة' : 'Completed'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sessions.filter(s => s.is_completed).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-pink-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'اقتراحات AI' : 'AI Suggested'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sessions.filter(s => s.ai_suggested).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Calendar View */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-pink-200/50 dark:border-blue-700/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'جدول الأسبوع' : 'Weekly Schedule'}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Days Header */}
              <div className="grid grid-cols-8 border-b border-gray-200 dark:border-slate-700">
                <div className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'الوقت' : 'Time'}
                </div>
                {weekDays.map((day, i) => {
                  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  return (
                    <div
                      key={i}
                      className={`p-4 text-center ${
                        isToday 
                          ? 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-blue-900/30 dark:to-indigo-900/30' 
                          : ''
                      }`}
                    >
                      <div className={`text-sm font-medium ${
                        isToday 
                          ? 'text-pink-600 dark:text-blue-400' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {format(day, 'EEE', { locale: language === 'ar' ? ar : enUS })}
                      </div>
                      <div className={`text-lg font-bold ${
                        isToday 
                          ? 'text-pink-600 dark:text-blue-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time Slots */}
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {timeSlots.map(hour => (
                  <div key={hour} className="grid grid-cols-8 min-h-[80px]">
                    <div className="p-4 text-sm text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-slate-700">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const daySessions = getSessionsForDate(day).filter(session => {
                        const startHour = new Date(session.scheduled_start_at).getHours();
                        return startHour === hour;
                      });

                      return (
                        <div
                          key={dayIndex}
                          className="relative p-2 border-l border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          {daySessions.map(session => {
                            const start = new Date(session.scheduled_start_at);
                            const end = new Date(session.scheduled_end_at);
                            const duration = (end.getTime() - start.getTime()) / (1000 * 60);
                            const height = Math.max((duration / 60) * 80, 40);

                            return (
                              <div
                                key={session.id}
                                className={`absolute left-2 right-2 rounded-lg p-2 text-xs shadow-md cursor-pointer group ${
                                  session.ai_suggested
                                    ? 'bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 border border-purple-300 dark:border-purple-700'
                                    : 'bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/50 dark:to-rose-900/50 border border-pink-300 dark:border-pink-700'
                                }`}
                                style={{ 
                                  height: `${height}px`,
                                  top: '4px',
                                }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 dark:text-white truncate">
                                      {session.task_title || (language === 'ar' ? 'جلسة دراسة' : 'Study Session')}
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
                                    </div>
                                    {session.ai_suggested && (
                                      <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 mt-1">
                                        <Sparkles className="w-3 h-3" />
                                        <span>AI</span>
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => deleteSession(session.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-opacity"
                                  >
                                    <Trash2 className="w-3 h-3 text-red-500" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-blue-100 dark:to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-10 h-10 text-pink-600 dark:text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'لا توجد مهام للجدولة' : 'No Tasks to Schedule'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {language === 'ar' 
                ? 'أضف بعض المهام أولاً للحصول على اقتراحات جدولة ذكية'
                : 'Add some tasks first to get smart scheduling suggestions'}
            </p>
            <button
              onClick={() => navigate('/tasks')}
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 dark:from-blue-600 dark:to-indigo-600 text-white font-medium hover:from-pink-600 hover:to-rose-600 transition-all"
            >
              <Plus className="w-5 h-5 ml-2" />
              {language === 'ar' ? 'إضافة مهمة' : 'Add Task'}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
