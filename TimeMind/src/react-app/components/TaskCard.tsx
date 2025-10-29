import { useState } from 'react';
import { TaskType } from '@/shared/types';
import { useLanguage } from '@/react-app/hooks/useLanguage';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  BookOpen,
  Edit3,
  Trash2
} from 'lucide-react';

interface TaskCardProps {
  task: TaskType;
  onToggleComplete: (taskId: number, completed: boolean) => Promise<void>;
  onEdit: (task: TaskType) => void;
  onDelete: (taskId: number) => Promise<void>;
}

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const [loading, setLoading] = useState(false);
  const { t, language } = useLanguage();

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      await onToggleComplete(task.id, !task.is_completed);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(t('tasks.deleteConfirm'))) {
      await onDelete(task.id);
    }
  };

  const getPriorityColor = (priority: number) => {
    const colors = {
      1: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
      2: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      3: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
      4: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      5: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[priority as keyof typeof colors] || colors[3];
  };

  const getPriorityLabel = (priority: number) => {
    const labels = {
      1: t('priority.veryLow'),
      2: t('priority.low'),
      3: t('priority.medium'),
      4: t('priority.high'),
      5: t('priority.urgent'),
    };
    return labels[priority as keyof typeof labels] || t('priority.medium');
  };

  const isOverdue = task.deadline_at && new Date(task.deadline_at) < new Date() && !task.is_completed;
  const isUrgent = task.deadline_at && new Date(task.deadline_at) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && !task.is_completed;

  return (
    <div className={`group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border transition-all duration-200 hover:shadow-lg ${
      task.is_completed 
        ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' 
        : isOverdue
        ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
        : isUrgent
        ? 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10'
        : 'border-gray-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-blue-600'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <button
            onClick={handleToggleComplete}
            disabled={loading}
            className={`mt-1 transition-colors ${
              task.is_completed
                ? 'text-green-500 hover:text-green-600'
                : 'text-gray-400 hover:text-pink-500 dark:hover:text-blue-500'
            }`}
          >
            {task.is_completed ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <Circle className="w-6 h-6" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-semibold mb-2 ${
              task.is_completed 
                ? 'line-through text-gray-500 dark:text-gray-400' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className={`text-sm mb-3 ${
                task.is_completed 
                  ? 'text-gray-400 dark:text-gray-500' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}>
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className={`px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                {getPriorityLabel(task.priority)}
              </span>

              {task.estimated_duration && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-full font-medium">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {task.estimated_duration} {t('time.minutes')}
                </span>
              )}

              {task.subject && (
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full font-medium">
                  <BookOpen className="w-3 h-3 inline mr-1" />
                  {task.subject}
                </span>
              )}

              {task.deadline_at && (
                <span className={`px-2 py-1 rounded-full font-medium ${
                  isOverdue
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : isUrgent
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {new Date(task.deadline_at).toLocaleDateString(language === 'ar' ? 'ar' : 'en')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
