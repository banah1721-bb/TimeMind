import { useState } from 'react';
import { useLanguage } from '@/react-app/hooks/useLanguage';
import { Plus, Send } from 'lucide-react';
import { CreateTaskType } from '@/shared/types';

interface QuickAddTaskProps {
  onAdd: (task: CreateTaskType) => Promise<void>;
}

export default function QuickAddTask({ onAdd }: QuickAddTaskProps) {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onAdd({
        title: title.trim(),
        priority: 3,
      });
      setTitle('');
      setIsExpanded(false);
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 dark:from-blue-600 dark:to-indigo-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 font-medium"
      >
        <Plus className="w-5 h-5" />
        {language === 'ar' ? 'إضافة مهمة سريعة' : 'Quick Add Task'}
      </button>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50"
    >
      <div className="flex gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={language === 'ar' ? 'ما هي مهمتك التالية؟' : "What's your next task?"}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 dark:focus:ring-blue-500 focus:border-transparent"
          autoFocus
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!title.trim() || loading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 dark:from-blue-600 dark:to-indigo-600 text-white font-medium hover:from-pink-600 hover:to-rose-600 dark:hover:from-blue-700 dark:hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          {loading ? '...' : (language === 'ar' ? 'إضافة' : 'Add')}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsExpanded(false);
            setTitle('');
          }}
          className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
        >
          {language === 'ar' ? 'إلغاء' : 'Cancel'}
        </button>
      </div>
    </form>
  );
}
