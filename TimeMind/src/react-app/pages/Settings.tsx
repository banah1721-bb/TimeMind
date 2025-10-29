import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import Layout from "@/react-app/components/Layout";
import { useNotifications } from "@/react-app/hooks/useNotifications";
import { useLanguage } from "@/react-app/hooks/useLanguage";
import { UserPreferencesType } from "@/shared/types";
import { Bell, Clock, Save, Check, Languages } from "lucide-react";

export default function Settings() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const { settings: notificationSettings, requestPermission } = useNotifications();
  const { t, language, setLanguage } = useLanguage();
  const [preferences, setPreferences] = useState<UserPreferencesType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/preferences');
      const data = await response.json();
      setPreferences(data);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    setSaving(true);
    setSaved(false);

    try {
      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled && notificationSettings.permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }

    setPreferences(prev => prev ? { ...prev, notification_enabled: enabled } : null);
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

  if (!preferences) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">{t('settings.loadFailed')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {t('settings.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('settings.subtitle')}
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 dark:from-blue-600 dark:to-indigo-600 text-white hover:from-pink-600 hover:to-rose-600 dark:hover:from-blue-700 dark:hover:to-indigo-700'
            }`}
          >
            {saved ? (
              <>
                <Check className="w-5 h-5 ml-2" />
                {t('common.saved')}
              </>
            ) : (
              <>
                <Save className="w-5 h-5 ml-2" />
                {saving ? t('common.saving') : t('settings.saveChanges')}
              </>
            )}
          </button>
        </div>

        {/* Language Settings */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
              <Languages className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="mr-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings.language.title')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.language.subtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setLanguage('ar')}
              className={`p-4 rounded-xl border-2 transition-all ${
                language === 'ar'
                  ? 'border-pink-500 dark:border-blue-500 bg-pink-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-slate-600 hover:border-pink-300 dark:hover:border-blue-600'
              }`}
            >
              <div className="text-center">
                <p className="text-2xl mb-2">🇸🇦</p>
                <p className="font-medium text-gray-900 dark:text-white">{t('settings.language.arabic')}</p>
              </div>
            </button>

            <button
              onClick={() => setLanguage('en')}
              className={`p-4 rounded-xl border-2 transition-all ${
                language === 'en'
                  ? 'border-pink-500 dark:border-blue-500 bg-pink-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-slate-600 hover:border-pink-300 dark:hover:border-blue-600'
              }`}
            >
              <div className="text-center">
                <p className="text-2xl mb-2">🇬🇧</p>
                <p className="font-medium text-gray-900 dark:text-white">{t('settings.language.english')}</p>
              </div>
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-blue-100 dark:to-indigo-100 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-pink-600 dark:text-blue-600" />
            </div>
            <div className="mr-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings.notifications.title')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.notifications.subtitle')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-pink-50/50 dark:bg-slate-700/50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t('settings.notifications.enable')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('settings.notifications.description')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notification_enabled}
                  onChange={(e) => handleNotificationToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:right-[4px] rtl:after:right-auto rtl:after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-rose-500 dark:peer-checked:from-blue-600 dark:peer-checked:to-indigo-600"></div>
              </label>
            </div>

            {notificationSettings.permission !== 'granted' && preferences.notification_enabled && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {t('settings.notifications.warning')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Study Time Settings */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="mr-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings.studyTime.title')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.studyTime.subtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.studyTime.startTime')}
              </label>
              <input
                type="time"
                value={preferences.preferred_study_start_time}
                onChange={(e) => setPreferences({ ...preferences, preferred_study_start_time: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 dark:focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.studyTime.endTime')}
              </label>
              <input
                type="time"
                value={preferences.preferred_study_end_time}
                onChange={(e) => setPreferences({ ...preferences, preferred_study_end_time: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 dark:focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.studyTime.breakDuration')}
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={preferences.break_duration}
                onChange={(e) => setPreferences({ ...preferences, break_duration: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 dark:focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.studyTime.maxDuration')}
              </label>
              <input
                type="number"
                min="30"
                max="240"
                value={preferences.max_session_duration}
                onChange={(e) => setPreferences({ ...preferences, max_session_duration: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 dark:focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
