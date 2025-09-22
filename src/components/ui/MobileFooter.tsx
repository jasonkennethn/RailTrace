import React from 'react';
import { 
  Home, 
  BarChart3, 
  Brain, 
  Settings, 
  Download, 
  FileText, 
  Plus, 
  User, 
  MessageSquare, 
  Calendar, 
  AlertTriangle, 
  Wrench, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  ExternalLink, 
  CheckCircle,
  Play
} from 'lucide-react';

export interface FooterItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  isFab?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

interface MobileFooterProps {
  items: FooterItem[];
  className?: string;
}

export function MobileFooter({ items, className = '' }: MobileFooterProps) {
  const regularItems = items.filter(item => !item.isFab);
  const fabItems = items.filter(item => item.isFab);

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Regular Footer Items */}
      <div className="flex items-center justify-around px-2 py-2 bg-white dark:bg-gray-900">
        {regularItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`
              flex flex-col items-center justify-center p-2 min-h-[44px] min-w-[44px] rounded-lg transition-all duration-200
              ${item.isActive 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              }
            `}
          >
            <div className="flex items-center justify-center w-6 h-6 mb-1">
              {item.icon}
            </div>
            <span className="text-xs font-medium leading-tight text-center">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* FAB Items */}
      {fabItems.length > 0 && (
        <div className="flex items-center justify-center pb-2 bg-white dark:bg-gray-900">
          {fabItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`
                flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95
                ${item.variant === 'primary' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                  item.variant === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' :
                  item.variant === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                  item.variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' :
                  'bg-gray-600 hover:bg-gray-700 text-white'
                }
              `}
            >
              <div className="flex items-center justify-center w-6 h-6">
                {item.icon}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Predefined footer configurations for different dashboards
export const FooterConfigs = {
  adminDashboard: (onNavigate: (route: string) => void): FooterItem[] => [
    {
      id: 'home',
      icon: <Home className="w-5 h-5" />,
      label: 'Home',
      onClick: () => onNavigate('/admin'),
      isActive: true
    },
    {
      id: 'reports',
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Reports',
      onClick: () => onNavigate('/admin_reports.html')
    },
    {
      id: 'ai-analytics',
      icon: <Brain className="w-5 h-5" />,
      label: 'AI Analytics',
      onClick: () => onNavigate('/admin_settings/ai_analytics__predictive_insights/code.html')
    },
    {
      id: 'settings',
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings',
      onClick: () => onNavigate('/admin_settings/code.html')
    }
  ],

  reportsAnalytics: (onNavigate: (route: string) => void): FooterItem[] => [
    {
      id: 'export',
      icon: <Download className="w-5 h-5" />,
      label: 'Export',
      onClick: () => onNavigate('/admin_reports.html')
    },
    {
      id: 'view-reports',
      icon: <FileText className="w-5 h-5" />,
      label: 'View Reports',
      onClick: () => onNavigate('/admin_reports.html')
    },
    {
      id: 'generate-report',
      icon: <Plus className="w-5 h-5" />,
      label: 'Generate Report',
      onClick: () => onNavigate('/admin_reports.html'),
      isFab: true,
      variant: 'primary'
    }
  ],

  aiAnalyticsOverview: (onNavigate: (route: string) => void): FooterItem[] => [
    {
      id: 'vendor',
      icon: <User className="w-5 h-5" />,
      label: 'Vendor',
      onClick: () => onNavigate('/admin_settings/ai_analytics__predictive_insights/code.html')
    },
    {
      id: 'predictive',
      icon: <Calendar className="w-5 h-5" />,
      label: 'Predictive',
      onClick: () => onNavigate('/admin_settings/ai_analytics__predictive_insights/code.html')
    },
    {
      id: 'anomalies',
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'Anomalies',
      onClick: () => onNavigate('/admin_settings/ai_analytics__anomaly_details/code.html')
    },
    {
      id: 'run-analysis',
      icon: <Play className="w-5 h-5" />,
      label: 'Run Analysis',
      onClick: () => onNavigate('/admin_settings/ai_analytics__predictive_insights/code.html'),
      isFab: true,
      variant: 'success'
    }
  ],

  vendorPerformance: (onNavigate: (route: string) => void): FooterItem[] => [
    {
      id: 'report',
      icon: <FileText className="w-5 h-5" />,
      label: 'Report',
      onClick: () => onNavigate('/admin_reports.html')
    },
    {
      id: 'message-vendor',
      icon: <MessageSquare className="w-5 h-5" />,
      label: 'Message Vendor',
      onClick: () => onNavigate('/admin_settings/code.html')
    },
    {
      id: 'profile',
      icon: <User className="w-5 h-5" />,
      label: 'Profile',
      onClick: () => onNavigate('/admin_settings/code.html')
    }
  ],

  predictiveInsights: (onNavigate: (route: string) => void): FooterItem[] => [
    {
      id: 'predictive-report',
      icon: <FileText className="w-5 h-5" />,
      label: 'Predictive Report',
      onClick: () => onNavigate('/admin_reports.html')
    },
    {
      id: 'schedule-maintenance',
      icon: <Calendar className="w-5 h-5" />,
      label: 'Schedule Maintenance',
      onClick: () => onNavigate('/admin_settings/code.html')
    },
    {
      id: 'alerts',
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'Alerts',
      onClick: () => onNavigate('/admin_settings/code.html')
    }
  ],

  anomalyDetails: (onNavigate: (route: string) => void): FooterItem[] => [
    {
      id: 'review',
      icon: <FileText className="w-5 h-5" />,
      label: 'Review',
      onClick: () => onNavigate('/admin_settings/ai_analytics__anomaly_details/code.html')
    },
    {
      id: 'anomaly-report',
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Anomaly Report',
      onClick: () => onNavigate('/admin_reports.html')
    },
    {
      id: 'assign-engineer',
      icon: <Wrench className="w-5 h-5" />,
      label: 'Assign Engineer',
      onClick: () => onNavigate('/admin_settings/code.html')
    }
  ],

  blockchainWizard: (onNavigate: (route: string) => void): FooterItem[] => [
    {
      id: 'previous',
      icon: <ChevronLeft className="w-5 h-5" />,
      label: 'Previous',
      onClick: () => onNavigate('/admin_blockchain_audit/code.html')
    },
    {
      id: 'next',
      icon: <ChevronRight className="w-5 h-5" />,
      label: 'Next',
      onClick: () => onNavigate('/admin_blockchain_audit/code.html')
    },
    {
      id: 'copy-tx',
      icon: <Copy className="w-5 h-5" />,
      label: 'Copy Tx',
      onClick: () => onNavigate('/admin_blockchain_audit/code.html')
    },
    {
      id: 'view-bsc',
      icon: <ExternalLink className="w-5 h-5" />,
      label: 'View on BSC',
      onClick: () => onNavigate('/admin_blockchain_audit/code.html')
    },
    {
      id: 'done',
      icon: <CheckCircle className="w-5 h-5" />,
      label: 'Done',
      onClick: () => onNavigate('/admin_blockchain_audit/code.html'),
      isFab: true,
      variant: 'success'
    }
  ]
};
