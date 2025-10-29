import { useState } from 'react';
import { X, Calendar, Clock, AlertTriangle, BookOpen } from 'lucide-react';
import { CreateTaskType } from '@/shared/types';
import { useLanguage } from '@/react-app/hooks/useLanguage';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: CreateTaskType) => Promise<void>;
}

export default function TaskModal({ isOpen, onClose, onSave }: TaskModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<CreateTaskType>({
    title: '',
    description: '',
    priority: 3,
    estimated_duration: 60,
    deadline_at: '',
    subject: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      await onSave({
        ...formData,
        deadline_at: formData.deadline_at || undefined,
        description: formData.description || undefined,
        subject: formData.subject || undefined,
        estimated_duration: formData.estimated_duration || undefined,
      });
      setFormData({
        title: '',
        description: '',
        priority: 3,
        estimated_duration: 60,
        deadline_at: '',
        subject: '',
      });
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const priorityLabels = {
    1: t('priority.veryLow'),
    2: t('priority.low'),
    3: t('priority.medium'),
    4: t('priority.high'),
    5: t('priority.urgent'),
  };

  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md mx-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('taskModal.title')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('taskModal.titleLabel')}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 dark:focus:ring-blue-500 focus:border-transparent"
              placeholder={t('taskModal.titlePlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('taskModal.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 dark:focus:ring-blue-500 focus:border-transparent"
              placeholder={t('taskModal.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                {t('taskModal.priority')}
              </label>
              <select
                value={formData.priority}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= 5) {
                    setFormData({ ...formData, priority: value as 1 | 2 | 3 | 4 | 5 });
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 dark:focus:ring-blue-500"
              >
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                {t('taskModal.duration')}
              </label>
              <input
                type="number"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({ ...formData, estimated_duration: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 dark:focus:ring-blue-500"
                min="15"
                max="480"
                step="15"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                {t('taskModal.deadline')}
              </label>
              <input
                type="datetime-local"
                value={formData.deadline_at}
                onChange={(e) => setFormData({ ...formData, deadline_at: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 dark:focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <BookOpen className="w-4 h-4 inline mr-1" />
                {t('taskModal.subject')}
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 dark:focus:ring-blue-500"
                placeholder={t('taskModal.subjectPlaceholder')}
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 dark:from-blue-600 dark:to-indigo-600 text-white font-medium hover:from-pink-600 hover:to-rose-600 dark:hover:from-blue-700 dark:hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? t('common.saving') : t('taskModal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
