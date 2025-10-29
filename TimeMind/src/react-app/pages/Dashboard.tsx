import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import Layout from "@/react-app/components/Layout";
import { useLanguage } from "@/react-app/hooks/useLanguage";
import { TaskType, StudySessionType, UserPreferencesType, CreateTaskType } from "@/shared/types";
import {
  CheckSquare,
  Clock,
  Calendar,
  TrendingUp,
  Plus,
  AlertCircle,
  Brain,
} from "lucide-react";
import PomodoroTimer from "@/react-app/components/PomodoroTimer";
import ProductivityChart from "@/react-app/components/ProductivityChart";
import SubjectDistribution from "@/react-app/components/SubjectDistribution";
import TaskStats from "@/react-app/components/TaskStats";
import QuickAddTask from "@/react-app/components/QuickAddTask";

export default function Dashboard() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [todaySessions, setTodaySessions] = useState<StudySessionType[]>([]);
  const [, setPreferences] = useState<UserPreferencesType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, sessionsRes, preferencesRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/study-sessions"),
        fetch("/api/preferences"),
      ]);

      const [tasksData, sessionsData, preferencesData] = await Promise.all([
        tasksRes.json(),
        sessionsRes.json(),
        preferencesRes.json(),
      ]);

      setTasks(tasksData);
      
      // Filter today's sessions
      const today = new Date().toISOString().split("T")[0];
      const todaySessionsFiltered = sessionsData.filter((session: StudySessionType) =>
        session.scheduled_start_at.startsWith(today)
      );
      setTodaySessions(todaySessionsFiltered);
      
      setPreferences(preferencesData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAddTask = async (taskData: CreateTaskType) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      
      if (response.ok) {
        const newTask = await response.json();
        setTasks([newTask, ...tasks]);
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  if (isPending || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Clock className="w-8 h-8 animate-spin text-pink-600 dark:text-blue-600" />
        </div>
      </Layout>
    );
  }

  const incompleteTasks = tasks.filter((task) => !task.is_completed);
  const urgentTasks = incompleteTasks.filter((task) => {
    if (!task.deadline_at) return false;
    const deadline = new Date(task.deadline_at);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return deadline <= threeDaysFromNow;
  });

  const completionRate = tasks.length > 0 
    ? Math.round(((tasks.length - incompleteTasks.length) / tasks.length) * 100)
    : 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {t('dashboard.welcome')}, {user?.google_user_data.given_name || "User"}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('dashboard.subtitle')}
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => navigate("/tasks")}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 dark:from-blue-600 dark:to-indigo-600 text-white font-medium hover:from-pink-600 hover:to-rose-600 dark:hover:from-blue-700 dark:hover:to-indigo-700 transition-all"
            >
              <Plus className="w-4 h-4 ml-2" />
              {t('dashboard.addTask')}
            </button>
          </div>
        </div>

        {/* Enhanced Stats */}
        <TaskStats tasks={tasks} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-blue-100 dark:to-indigo-100 rounded-xl flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-pink-600 dark:text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.stats.pending')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{incompleteTasks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.stats.completion')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.stats.urgent')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{urgentTasks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.stats.todaySessions')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todaySessions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pomodoro Timer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <PomodoroTimer />
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <ProductivityChart tasks={tasks} />
            <SubjectDistribution tasks={tasks} />
          </div>
        </div>

        {/* Quick Add Task */}
        <QuickAddTask onAdd={handleQuickAddTask} />

        {/* Quick Actions & Today's Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Urgent Tasks */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.urgentTasks')}</h3>
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
            
            {urgentTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {t('dashboard.noUrgentTasks')}
              </p>
            ) : (
              <div className="space-y-3">
                {urgentTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-600">
                        {task.deadline_at && (
                          <>
                            {t('dashboard.deadline')}: {new Date(task.deadline_at).toLocaleDateString(language)}
                          </>
                        )}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                      {t('dashboard.priority')} {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.todaySchedule')}</h3>
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            
            {todaySessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">{t('dashboard.noSchedule')}</p>
                <button
                  onClick={() => navigate("/schedule")}
                  className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  <Brain className="w-4 h-4 ml-2" />
                  {t('dashboard.aiSuggestions')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {session.task_title || t('dashboard.studySession')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(session.scheduled_start_at).toLocaleTimeString(language, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} - {new Date(session.scheduled_end_at).toLocaleTimeString(language, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {session.ai_suggested && (
                      <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                        {t('dashboard.aiSuggested')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
