import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardCard from '../components/ui/DashboardCard';
import ChartContainer, { ChartType } from '../components/charts/ChartContainer';
import { DashboardCard as DashboardCardType } from '../types';
import { AnalyticsService, UsersService } from '../services/dataService';
import { User } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (user) {
      // Load real-time data
      const loadDashboardData = async () => {
        try {
          const [analyticsData, usersData] = await Promise.all([
            AnalyticsService.getDashboardData(user.role),
            UsersService.getUsers()
          ]);
          setDashboardData(analyticsData);
          setUsers(usersData);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          setLoading(false);
        }
      };
      
      loadDashboardData();
      
      // Set up real-time subscription for users
      const unsubscribe = UsersService.subscribeToUsers((fetchedUsers) => {
        setUsers(fetchedUsers);
      });
      
      return () => unsubscribe();
    }
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Role-specific dashboard data with real-time counts
  const getDashboardCards = (): DashboardCardType[] => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.lastLogin && u.lastLogin > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;
    const inspectors = users.filter(u => u.role === 'inspector').length;
    const admins = users.filter(u => u.role === 'admin').length;
    
    switch (user?.role) {
      case 'admin':
        return [
          { title: 'Total Users', value: totalUsers.toString(), change: `+${Math.floor(totalUsers * 0.08)} this month`, changeType: 'positive', icon: 'Users' },
          { title: 'Active Inspections', value: (dashboardData?.summary?.totalInspections || 89).toString(), change: '+5 today', changeType: 'positive', icon: 'CheckCircle' },
          { title: 'System Health', value: '98.5%', change: '+0.3% uptime', changeType: 'positive', icon: 'Shield' },
          { title: 'Data Storage', value: '2.4TB', change: '+150GB this week', changeType: 'neutral', icon: 'Database' },
        ];
      case 'drm':
        return [
          { title: 'Division Reports', value: '24', change: '+4 this week', changeType: 'positive', icon: 'BarChart3' },
          { title: 'Active Users', value: totalUsers.toString(), change: `${activeUsers} online now`, changeType: 'neutral', icon: 'Users' },
          { title: 'Pending Approvals', value: (dashboardData?.summary?.pendingApprovals || 18).toString(), change: '6 urgent', changeType: 'negative', icon: 'Calendar' },
          { title: 'Division Performance', value: '92%', change: '+3% this month', changeType: 'positive', icon: 'TrendingUp' },
        ];
      case 'den':
        return [
          { title: 'Section Reports', value: '15', change: '+3 this month', changeType: 'positive', icon: 'BarChart3' },
          { title: 'Pending Tasks', value: (dashboardData?.summary?.pendingTasks || 8).toString(), change: '+2 assigned today', changeType: 'positive', icon: 'TrendingUp' },
          { title: 'Inspection Overview', value: '94%', change: '+3% efficiency', changeType: 'positive', icon: 'Eye' },
          { title: 'Active Inspectors', value: inspectors.toString(), change: `${Math.floor(inspectors * 0.8)} available`, changeType: 'neutral', icon: 'UserPlus' },
          { title: 'Today\'s Inspections', value: (dashboardData?.summary?.todayInspections || 12).toString(), change: '8 completed', changeType: 'positive', icon: 'FileText' },
          { title: 'Approval Requests', value: (dashboardData?.summary?.pendingApprovals || 6).toString(), change: '3 urgent', changeType: 'negative', icon: 'CheckCircle' },
        ];
      case 'inspector':
        return [
          { title: 'Today\'s Tasks', value: (dashboardData?.summary?.assignedTasks || 6).toString(), change: '3 completed', changeType: 'positive', icon: 'CheckCircle' },
          { title: 'Products Scanned', value: (dashboardData?.summary?.scannedProducts || 23).toString(), change: '+8 today', changeType: 'positive', icon: 'Eye' },
          { title: 'Inspections Due', value: (dashboardData?.summary?.dueInspections || 4).toString(), change: '2 urgent', changeType: 'negative', icon: 'Clock' },
          { title: 'Section Coverage', value: '87%', change: '+5% this week', changeType: 'positive', icon: 'TrendingUp' },
        ];
      case 'manufacturer':
        return [
          { title: 'Active Orders', value: (dashboardData?.summary?.activeOrders || 15).toString(), change: '+3 this week', changeType: 'positive', icon: 'Package' },
          { title: 'Products Shipped', value: (dashboardData?.summary?.productsShipped || 1247).toString(), change: '+89 this month', changeType: 'positive', icon: 'Truck' },
          { title: 'AI Performance Score', value: '91.2', change: '+2.3 points', changeType: 'positive', icon: 'TrendingUp' },
          { title: 'Delivery Rating', value: '96%', change: '+1.2% improvement', changeType: 'positive', icon: 'CheckCircle' },
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
               user.role === 'den' ? 'Section & Sub-Division Analysis' :
               user.role === 'inspector' ? 'Daily Inspections' :
               'Monthly Orders',
        data: user.role === 'admin' ? [
          { name: 'Jan', value: dashboardData?.summary?.totalUsers || 120 },
          { name: 'Feb', value: dashboardData?.summary?.totalInspections || 98 },
          { name: 'Mar', value: dashboardData?.summary?.totalProducts || 134 },
          { name: 'Apr', value: 156 },
          { name: 'May', value: 142 },
          { name: 'Jun', value: 178 },
        ] : user.role === 'drm' ? [
          { name: 'Week 1', value: 85 },
          { name: 'Week 2', value: 92 },
          { name: 'Week 3', value: 78 },
          { name: 'Week 4', value: 95 },
          { name: 'Week 5', value: 88 },
          { name: 'Week 6', value: 101 },
        ] : user.role === 'den' ? [
          { name: 'Sect A', value: 45 },
          { name: 'Sect B', value: 38 },
          { name: 'Sect C', value: 52 },
          { name: 'Sect D', value: 41 },
          { name: 'Sect E', value: 49 },
          { name: 'Sect F', value: 36 },
        ] : user.role === 'inspector' ? [
          { name: 'Mon', value: 8 },
          { name: 'Tue', value: 12 },
          { name: 'Wed', value: 6 },
          { name: 'Thu', value: 15 },
          { name: 'Fri', value: 10 },
          { name: 'Sat', value: 4 },
        ] : [
          { name: 'Rail Components', value: 234 },
          { name: 'Signaling', value: 189 },
          { name: 'Track Parts', value: 156 },
          { name: 'Fasteners', value: 134 },
          { name: 'Others', value: 98 },
        ]
      },
      {
        type: 'line',
        title: user.role === 'admin' ? 'System Performance' :
               user.role === 'drm' ? 'Division Performance' :
               user.role === 'den' ? 'Task Completion Rate' :
               user.role === 'inspector' ? 'Inspection Quality Score' :
               'Product Quality Rating',
        data: user.role === 'admin' ? [
          { name: 'Week 1', value: 85 },
          { name: 'Week 2', value: 88 },
          { name: 'Week 3', value: 92 },
          { name: 'Week 4', value: 89 },
          { name: 'Week 5', value: 95 },
          { name: 'Week 6', value: 93 },
        ] : user.role === 'drm' ? [
          { name: 'Jan', value: 78 },
          { name: 'Feb', value: 82 },
          { name: 'Mar', value: 85 },
          { name: 'Apr', value: 89 },
          { name: 'May', value: 92 },
          { name: 'Jun', value: 87 },
        ] : user.role === 'den' ? [
          { name: 'Week 1', value: 72 },
          { name: 'Week 2', value: 78 },
          { name: 'Week 3', value: 85 },
          { name: 'Week 4', value: 82 },
          { name: 'Week 5', value: 90 },
          { name: 'Week 6', value: 88 },
        ] : user.role === 'inspector' ? [
          { name: 'Week 1', value: 88 },
          { name: 'Week 2', value: 92 },
          { name: 'Week 3', value: 85 },
          { name: 'Week 4', value: 94 },
          { name: 'Week 5', value: 89 },
          { name: 'Week 6', value: 96 },
        ] : [
          { name: 'Jan', value: 4.2 },
          { name: 'Feb', value: 4.5 },
          { name: 'Mar', value: 4.3 },
          { name: 'Apr', value: 4.7 },
          { name: 'May', value: 4.6 },
          { name: 'Jun', value: 4.8 },
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

  const cards = getDashboardCards();
  const charts = getChartsForRole();

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'drm': return 'Divisional Railway Manager';
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
          {getRoleTitle(user.role)} Dashboard
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
            { action: 'User added', item: users.length > 5 ? `New user: ${users[users.length-1]?.name || 'Unknown'}` : 'New inspector account', time: '2 hours ago' },
            { action: 'System backup', item: 'Automated backup completed', time: '4 hours ago' },
            { action: 'Security scan', item: 'Vulnerability check passed', time: '6 hours ago' },
            { action: 'Data export', item: 'Monthly report generated', time: '8 hours ago' },
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
            { action: 'Report generated', item: 'Weekly division summary', time: '1 hour ago' },
            { action: 'User approved', item: 'New field inspector', time: '3 hours ago' },
            { action: 'Schedule updated', item: 'Monthly inspection plan', time: '5 hours ago' },
            { action: 'Notification sent', item: 'Safety protocol update', time: '7 hours ago' },
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
            { action: 'Sub-division report', item: 'Weekly efficiency summary', time: '30 minutes ago' },
            { action: 'Task assigned', item: 'Track inspection - Section A', time: '2 hours ago' },
            { action: 'Inspection completed', item: 'Signal equipment check', time: '4 hours ago' },
            { action: 'Approval processed', item: 'Equipment requisition', time: '6 hours ago' },
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