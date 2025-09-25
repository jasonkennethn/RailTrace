import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardCard from '../components/ui/DashboardCard';
import ChartContainer, { ChartType } from '../components/charts/ChartContainer';
import { DashboardCard as CardType } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Role-specific dashboard data
  const getCardsForRole = (): CardType[] => {
    switch (user.role) {
      case 'admin':
        return [
          { title: 'Total Users', value: '1,234', change: '+12%', changeType: 'positive', icon: 'Users' },
          { title: 'System Approvals', value: '856', change: '+5%', changeType: 'positive', icon: 'CheckCircle' },
          { title: 'AI Analytics Score', value: '94.2', change: '+2.1', changeType: 'positive', icon: 'Brain' },
        ];
      case 'drm':
        return [
          { title: 'Division Inspections', value: '234', change: '+7%', changeType: 'positive', icon: 'Search' },
          { title: 'Pending Approvals', value: '12', change: '-3', changeType: 'negative', icon: 'Clock' },
          { title: 'Product Performance', value: '92%', change: '+3%', changeType: 'positive', icon: 'TrendingUp' },
          { title: 'AI Manufacturer Rating', value: '88.5', change: '+1.2', changeType: 'positive', icon: 'Star' },
        ];
      case 'sr_den':
        return [
          { title: 'Sub-Division Projects', value: '18', change: '+2', changeType: 'positive', icon: 'BarChart3' },
          { title: 'Pending Approvals', value: '8', change: '0', changeType: 'neutral', icon: 'Clock' },
          { title: 'DEN Performance', value: '91%', change: '+4%', changeType: 'positive', icon: 'Users' },
          { title: 'AI Insights Score', value: '89.3', change: '+2.8', changeType: 'positive', icon: 'Brain' },
        ];
      case 'den':
        return [
          { title: 'Section Approvals', value: '15', change: '+3', changeType: 'positive', icon: 'CheckCircle' },
          { title: 'Active Tasks', value: '28', change: '+5', changeType: 'positive', icon: 'UserPlus' },
          { title: 'Inspection Logs', value: '142', change: '+12%', changeType: 'positive', icon: 'FileText' },
          { title: 'Section Performance', value: '87%', change: '+2%', changeType: 'positive', icon: 'Activity' },
        ];
      case 'inspector':
        return [
          { title: 'Assigned Sections', value: '6', change: '+1', changeType: 'positive', icon: 'MapPin' },
          { title: 'Inspections Today', value: '8', change: '+2', changeType: 'positive', icon: 'CheckCircle' },
          { title: 'Products Scanned', value: '45', change: '+12', changeType: 'positive', icon: 'QrCode' },
        ];
      case 'manufacturer':
        return [
          { title: 'Pending Orders', value: '23', change: '+4', changeType: 'positive', icon: 'ShoppingCart' },
          { title: 'Products Delivered', value: '456', change: '+8%', changeType: 'positive', icon: 'Package' },
          { title: 'AI Performance Score', value: '91.2', change: '+2.3', changeType: 'positive', icon: 'Star' },
          { title: 'Delivery Rate', value: '94%', change: '-1%', changeType: 'negative', icon: 'Truck' },
        ];
      default:
        return [];
    }
  };

  const getChartsForRole = () => {
    const baseCharts = [
      {
        type: 'bar',
        title: user.role === 'admin' ? 'System Activity' : 
               user.role === 'drm' ? 'Division Inspections' :
               user.role === 'sr_den' ? 'Project Progress' :
               user.role === 'den' ? 'Section Tasks' :
               user.role === 'inspector' ? 'Daily Inspections' :
               'Monthly Orders',
        data: [
          { name: 'Jan', value: 120 },
          { name: 'Feb', value: 98 },
          { name: 'Mar', value: 134 },
          { name: 'Apr', value: 156 },
          { name: 'May', value: 142 },
          { name: 'Jun', value: 178 },
        ]
      },
      {
        type: 'line',
        title: user.role === 'admin' ? 'System Performance' :
               user.role === 'drm' ? 'Division Performance' :
               user.role === 'sr_den' ? 'Sub-Division Efficiency' :
               user.role === 'den' ? 'Section Efficiency' :
               user.role === 'inspector' ? 'Inspection Quality' :
               'Product Performance',
        data: [
          { name: 'Week 1', value: 85 },
          { name: 'Week 2', value: 88 },
          { name: 'Week 3', value: 92 },
          { name: 'Week 4', value: 89 },
          { name: 'Week 5', value: 95 },
          { name: 'Week 6', value: 93 },
        ]
      }
    ];

    if (user.role === 'admin' || user.role === 'drm') {
      baseCharts.push({
        type: 'pie',
        title: user.role === 'admin' ? 'User Distribution' : 'Division Status',
        data: [
          { name: 'Active', value: 65 },
          { name: 'Pending', value: 20 },
          { name: 'Completed', value: 15 },
        ]
      });
    }

    return baseCharts;
  };

  const cards = getCardsForRole();
  const charts = getChartsForRole();

  const getRoleTitle = () => {
    switch (user.role) {
      case 'admin': return 'Administrator';
      case 'drm': return 'Divisional Railway Manager';
      case 'sr_den': return 'Senior Divisional Engineer';
      case 'den': return 'Divisional Engineer';
      case 'inspector': return 'Field Inspector';
      case 'manufacturer': return 'Manufacturer';
      default: return 'User';
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {getRoleTitle()} Dashboard
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <DashboardCard key={index} {...card} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {charts.map((chart, index) => (
          <ChartContainer
            key={index}
            type={chart.type as ChartType['type']}
            data={chart.data}
            title={chart.title}
            height={300}
          />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {user.role === 'admin' && [
            { action: 'User created', item: 'New Inspector Account', time: '2 hours ago' },
            { action: 'System audit completed', item: 'Blockchain verification', time: '4 hours ago' },
            { action: 'Report generated', item: 'Monthly system usage', time: '6 hours ago' },
            { action: 'Role updated', item: 'DEN permissions modified', time: '8 hours ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{activity.item}</p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
            </div>
          ))}
          
          {user.role === 'drm' && [
            { action: 'Approval processed', item: 'High-value product request', time: '1 hour ago' },
            { action: 'Division report generated', item: 'Monthly inspection summary', time: '3 hours ago' },
            { action: 'User added', item: 'New Sr. DEN account', time: '5 hours ago' },
            { action: 'AI analysis completed', item: 'Manufacturer performance rating', time: '7 hours ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{activity.item}</p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
            </div>
          ))}

          {user.role === 'sr_den' && [
            { action: 'Project approved', item: 'Track modernization - Section A', time: '2 hours ago' },
            { action: 'DEN request processed', item: 'Budget approval for maintenance', time: '4 hours ago' },
            { action: 'Inspection reviewed', item: 'Field Inspector report verified', time: '6 hours ago' },
            { action: 'Sub-division report', item: 'Monthly performance summary', time: '8 hours ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{activity.item}</p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
            </div>
          ))}

          {user.role === 'den' && [
            { action: 'Task assigned', item: 'Track inspection to AEN Kumar', time: '1 hour ago' },
            { action: 'Approval granted', item: 'Product request from Inspector', time: '3 hours ago' },
            { action: 'Inspection log reviewed', item: 'Section A-123 maintenance', time: '5 hours ago' },
            { action: 'Section report generated', item: 'Weekly status summary', time: '7 hours ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{activity.item}</p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
            </div>
          ))}

          {user.role === 'inspector' && [
            { action: 'Product scanned', item: 'Rail Joint RJ-456', time: '30 minutes ago' },
            { action: 'Inspection recorded', item: 'Track Section A-123', time: '2 hours ago' },
            { action: 'Product requested', item: 'Additional fasteners for Section B', time: '4 hours ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{activity.item}</p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
            </div>
          ))}

          {user.role === 'manufacturer' && [
            { action: 'Order processed', item: 'Rail joints batch RJ-2024-001', time: '1 hour ago' },
            { action: 'Inventory updated', item: 'Track bolts stock replenished', time: '3 hours ago' },
            { action: 'Delivery completed', item: '500 sleepers to Mumbai Division', time: '5 hours ago' },
            { action: 'AI rating updated', item: 'Performance score: 91.2/100', time: '7 hours ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{activity.item}</p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;