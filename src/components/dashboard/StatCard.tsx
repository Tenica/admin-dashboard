import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  isDark?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  isDark = false,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600',
    green: isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600',
    yellow: isDark ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-50 text-yellow-600',
    red: isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600',
    purple: isDark ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-50 text-purple-600',
  };

  return (
    <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </h3>
            {trend && (
              <span className={`text-sm font-medium ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend.direction === 'up' ? '+' : '-'}{trend.value}%
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
