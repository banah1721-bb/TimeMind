import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from '@/react-app/hooks/useLanguage';
import { TaskType } from '@/shared/types';

interface ProductivityChartProps {
  tasks: TaskType[];
}

export default function ProductivityChart({ tasks }: ProductivityChartProps) {
  const { language } = useLanguage();

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const completedTasks = tasks.filter(task => 
        task.is_completed && 
        task.updated_at.startsWith(dateStr)
      );

      const dayName = language === 'ar' 
        ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][date.getDay()]
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];

      return {
        day: dayName,
        tasks: completedTasks.length,
        date: dateStr,
      };
    });
  }, [tasks, language]);

  const maxTasks = Math.max(...chartData.map(d => d.tasks), 1);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        {language === 'ar' ? 'إنتاجية الأسبوع' : 'Weekly Productivity'}
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
          <XAxis 
            dataKey="day" 
            stroke="#6b7280" 
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280" 
            style={{ fontSize: '12px' }}
            domain={[0, maxTasks + 1]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
          />
          <Bar dataKey="tasks" radius={[8, 8, 0, 0]}>
            {chartData.map((_entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#gradient${index})`}
              />
            ))}
          </Bar>
          <defs>
            {chartData.map((_d, index) => (
              <linearGradient key={`gradient${index}`} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4899" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
