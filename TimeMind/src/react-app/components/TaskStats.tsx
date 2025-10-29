import { useMemo } from 'react';
import { useLanguage } from '@/react-app/hooks/useLanguage';
import { TaskType } from '@/shared/types';
import { Trophy, Target, Flame, Award } from 'lucide-react';

interface TaskStatsProps {
  tasks: TaskType[];
}

export default function TaskStats({ tasks }: TaskStatsProps) {
  const { language } = useLanguage();

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.is_completed);
    const pending = tasks.filter(t => !t.is_completed);
    const urgent = pending.filter(t => t.priority >= 4);
    
    // Calculate completion rate
    const completionRate = tasks.length > 0 
      ? Math.round((completed.length / tasks.length) * 100)
      : 0;
    
    // Calculate streak (days with completed tasks)
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const hasCompletedTask = completed.some(t => 
        t.updated_at.startsWith(dateStr) && t.is_completed
      );
      if (hasCompletedTask) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      completionRate,
      streak,
      totalCompleted: completed.length,
      urgentPending: urgent.length,
    };
  }, [tasks]);

  const statCards = [
    {
      icon: Trophy,
      label: language === 'ar' ? 'معدل الإنجاز' : 'Completion Rate',
      value: `${stats.completionRate}%`,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-100 to-orange-100',
    },
    {
      icon: Flame,
      label: language === 'ar' ? 'سلسلة الأيام' : 'Day Streak',
      value: stats.streak,
      color: 'from-red-500 to-pink-500',
      bgColor: 'from-red-100 to-pink-100',
    },
    {
      icon: Award,
      label: language === 'ar' ? 'المهام المنجزة' : 'Tasks Completed',
      value: stats.totalCompleted,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-100 to-emerald-100',
    },
    {
      icon: Target,
      label: language === 'ar' ? 'مهام عاجلة متبقية' : 'Urgent Remaining',
      value: stats.urgentPending,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'from-purple-100 to-indigo-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50 transform hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.bgColor} dark:${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
              </div>
              <div className={`text-3xl font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
