import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import * as Icons from 'lucide-react';
import { DashboardCard as CardType } from '../../types';
import clsx from 'clsx';

interface DashboardCardProps extends CardType {
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  className
}) => {
  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="h-6 w-6" /> : <Icons.Circle className="h-6 w-6" />;
  };

  const getTrendIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={clsx(
      'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="bg-blue-50 rounded-lg p-2">
          <div className="text-blue-600">
            {getIconComponent(icon)}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {getTrendIcon()}
          <span className={clsx('text-sm font-medium', getChangeColor())}>
            {change}
          </span>
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
      </div>
    </div>
  );
};

export default DashboardCard;