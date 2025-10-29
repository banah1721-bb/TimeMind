import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useLanguage } from '@/react-app/hooks/useLanguage';
import { TaskType } from '@/shared/types';

interface SubjectDistributionProps {
  tasks: TaskType[];
}

const COLORS = [
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
];

export default function SubjectDistribution({ tasks }: SubjectDistributionProps) {
  const { language } = useLanguage();

  const chartData = useMemo(() => {
    const subjectCounts: Record<string, number> = {};
    
    tasks.forEach(task => {
      const subject = task.subject || (language === 'ar' ? 'غير محدد' : 'Unspecified');
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
    });

    return Object.entries(subjectCounts).map(([subject, count]) => ({
      name: subject,
      value: count,
    }));
  }, [tasks, language]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {language === 'ar' ? 'توزيع المواد' : 'Subject Distribution'}
        </h3>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {language === 'ar' ? 'لا توجد بيانات لعرضها' : 'No data to display'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        {language === 'ar' ? 'توزيع المواد' : 'Subject Distribution'}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props: any) => {
              const { name, percent } = props;
              return `${name}: ${((percent || 0) * 100).toFixed(0)}%`;
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
