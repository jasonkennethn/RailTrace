import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { SmartAddress } from './SmartAddress';
import { DynamicChart } from './DynamicChart';

interface PredictiveCardProps {
  title: string;
  address: string;
  predictivePercentage: number;
  maintenanceRecommendation: string;
  suggestedTimeline: string;
  status: 'critical' | 'warning' | 'normal';
  chartData: Array<{ x: number; y: number; label?: string; value?: number }>;
  chartType: 'line' | 'bar' | 'area';
  chartColor: string;
  className?: string;
}

export function PredictiveCard({
  title,
  address,
  predictivePercentage,
  maintenanceRecommendation,
  suggestedTimeline,
  status,
  chartData,
  chartType,
  chartColor,
  className = ''
}: PredictiveCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusConfig = () => {
    switch (status) {
      case 'critical':
        return {
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-700 dark:text-red-300',
          icon: AlertTriangle,
          iconColor: 'text-red-500'
        };
      case 'warning':
        return {
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
          textColor: 'text-amber-700 dark:text-amber-300',
          icon: AlertTriangle,
          iconColor: 'text-amber-500'
        };
      default:
        return {
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-700 dark:text-green-300',
          icon: TrendingUp,
          iconColor: 'text-green-500'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`bg-[#ffffff] dark:bg-[#161b22] rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-[#d0d7de] dark:border-[#30363d] ${className}`}>
      {/* Card Header */}
      <div className="p-4 border-b border-[#d0d7de] dark:border-[#30363d]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-[#0d1117] dark:text-[#c9d1d9]">{title}</h3>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
            <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor}`} />
            <span className={`text-sm font-medium ${statusConfig.textColor}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
        
        {/* Address */}
        <SmartAddress 
          address={address} 
          maxLength={8}
          className="mb-3"
        />
      </div>

      {/* Chart Section */}
      <div className="p-4">
        <div className="h-48 mb-4">
          <DynamicChart
            data={chartData}
            type={chartType}
            width={300}
            height={150}
            color={chartColor}
            gradientId={`${title.toLowerCase().replace(/\s+/g, '')}Gradient`}
            showPoints={true}
            showGrid={true}
            className="w-full h-full"
          />
        </div>

        {/* Predictive Analysis */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#57606a] dark:text-[#8b949e]">Predictive Score</span>
            <div className="flex items-center gap-2">
              {predictivePercentage > 70 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
              <span className={`text-lg font-bold ${predictivePercentage > 70 ? 'text-red-500' : 'text-green-500'}`}>
                {predictivePercentage}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#57606a] dark:text-[#8b949e]" />
            <span className="text-sm text-[#57606a] dark:text-[#8b949e]">{suggestedTimeline}</span>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      <div className="border-t border-[#d0d7de] dark:border-[#30363d]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-[#f0f2f5] dark:hover:bg-[#21262d] transition-colors touch-target"
        >
          <span className="text-sm font-medium text-[#57606a] dark:text-[#8b949e]">
            Maintenance Recommendation
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-[#57606a] dark:text-[#8b949e]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#57606a] dark:text-[#8b949e]" />
          )}
        </button>
        
        {expanded && (
          <div className="px-4 pb-4">
            <div className="bg-[#f0f2f5] dark:bg-[#21262d] rounded-lg p-3">
              <p className="text-sm text-[#0d1117] dark:text-[#c9d1d9] leading-relaxed">
                {maintenanceRecommendation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
