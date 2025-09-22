import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    isGood: boolean;
  };
  icon?: React.ReactNode;
  badge?: {
    text: string;
    variant: 'default' | 'success' | 'warning' | 'error';
  };
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon,
  badge 
}: StatsCardProps) {
  return (
    <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              {badge && (
                <Badge variant={badge.variant} size="sm" className="text-xs">
                  {badge.text}
                </Badge>
              )}
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {trend && (
                <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                  trend.isGood 
                    ? 'text-green-700 bg-green-100' 
                    : 'text-red-700 bg-red-100'
                }`}>
                  {trend.direction === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(trend.value)}%
                </div>
              )}
            </div>
            
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          
          {icon && (
            <div className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Modern gradient background pattern */}
      <div className="absolute top-0 right-0 -m-4 w-20 h-20 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 -m-2 w-12 h-12 bg-gradient-to-tr from-indigo-100/20 to-cyan-100/20 rounded-full opacity-40" />
    </Card>
  );
}