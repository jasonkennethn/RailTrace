import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Calendar, Filter, BarChart3, PieChart, TrendingUp, Users, Star, CheckCircle, AlertTriangle, Package, Truck } from 'lucide-react';
import ChartContainer from '../components/charts/ChartContainer';
import { AnalyticsService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<string>('user-activity');
  const [dateRange, setDateRange] = useState<string>('30days');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load real-time dashboard data
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AnalyticsService.getDashboardData(user?.role || 'admin');
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user?.role]);

  const isManufacturer = user?.role === 'manufacturer';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isManufacturer ? 'Manufacturing Reports & Analytics' : 'Reports & Analytics'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isManufacturer 
            ? 'Manufacturing performance insights and delivery analytics' 
            : 'System performance and statistical overview'
          }
        </p>
      </div>

      {/* Summary Statistics - Moved to Top */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {isManufacturer ? 'Manufacturing Performance Summary' : 'Summary Statistics'}
        </h2>
        {loading ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {isManufacturer ? (
              // Manufacturer-specific statistics
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Total Orders</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{dashboardData?.summary?.totalOrders || 156}</p>
                  <p className="text-xs text-blue-600 mt-1">This Month: {dashboardData?.summary?.monthlyOrders || 28}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Products Delivered</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 mt-1">{dashboardData?.summary?.totalProducts || 2834}</p>
                  <p className="text-xs text-green-600 mt-1">On Time: 94.2%</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">AI Performance Score</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-900 mt-1">91.2</p>
                  <p className="text-xs text-yellow-600 mt-1">Grade: Excellent</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">Revenue Generated</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900 mt-1">₹{((dashboardData?.summary?.totalRevenue || 285000000) / 10000000).toFixed(1)}Cr</p>
                  <p className="text-xs text-purple-600 mt-1">Growth: +12.3%</p>
                </div>
              </>
            ) : (
              // Original statistics for admin/drm
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Total Users</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{dashboardData?.summary?.totalUsers || 0}</p>
                  <p className="text-xs text-blue-600 mt-1">Active: {dashboardData?.summary?.activeUsers || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Total Products</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 mt-1">{dashboardData?.summary?.totalProducts || 0}</p>
                  <p className="text-xs text-green-600 mt-1">In System</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">Inspections</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-900 mt-1">{dashboardData?.summary?.totalInspections || 0}</p>
                  <p className="text-xs text-yellow-600 mt-1">Passed: {dashboardData?.summary?.passedInspections || 0}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-600">Failed Inspections</span>
                  </div>
                  <p className="text-2xl font-bold text-red-900 mt-1">{dashboardData?.summary?.failedInspections || 0}</p>
                  <p className="text-xs text-red-600 mt-1">Require Attention</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Charts Section */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isManufacturer ? (
            // Manufacturer-specific charts
            <>
              {/* Order Status Distribution */}
              <ChartContainer
                type="pie"
                data={[
                  { name: 'Completed', value: dashboardData?.orders?.filter((o: any) => o.status === 'delivered').length || 45 },
                  { name: 'In Progress', value: dashboardData?.orders?.filter((o: any) => o.status === 'dispatched').length || 23 },
                  { name: 'Pending', value: dashboardData?.orders?.filter((o: any) => o.status === 'pending').length || 12 }
                ]}
                title="Order Status Distribution"
                height={300}
              />

              {/* Product Category Performance */}
              <ChartContainer
                type="bar"
                data={[
                  { name: 'Rail Components', value: 234 },
                  { name: 'Signaling Equipment', value: 189 },
                  { name: 'Track Components', value: 156 },
                  { name: 'Fastening Systems', value: 134 },
                  { name: 'Safety Equipment', value: 98 }
                ]}
                title="Product Category Performance"
                height={300}
              />
            </>
          ) : (
            // Original charts for admin/drm (removed User Activity)
            <>
              {/* Inspection Status Chart */}
              <ChartContainer
                type="pie"
                data={[
                  { name: 'Passed', value: dashboardData?.summary?.passedInspections || 0 },
                  { name: 'Failed', value: dashboardData?.summary?.failedInspections || 0 }
                ]}
                title="Inspection Status Distribution"
                height={300}
              />

              {/* System Usage Chart */}
              <ChartContainer
                type="bar"
                data={[
                  { name: 'Products', value: dashboardData?.summary?.totalProducts || 0 },
                  { name: 'Inspections', value: dashboardData?.summary?.totalInspections || 0 },
                  { name: 'Users', value: dashboardData?.summary?.totalUsers || 0 }
                ]}
                title="System Usage Overview"
                height={300}
              />
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isManufacturer ? 'Recent Manufacturing Activity' : 'Recent Activity'}
          </h3>
          <div className="space-y-3">
            {isManufacturer ? (
              // Manufacturer-specific activity
              [
                { action: 'Order completed', item: 'Rail joints batch RJ-2024-045', time: '2 hours ago', status: 'completed' },
                { action: 'Product shipped', item: '500 Track bolts to Mumbai Division', time: '4 hours ago', status: 'shipped' },
                { action: 'Quality inspection passed', item: 'Signal components batch SC-2024-023', time: '6 hours ago', status: 'passed' },
                { action: 'AI performance updated', item: 'Overall score improved to 91.2', time: '8 hours ago', status: 'updated' },
                { action: 'New order received', item: 'Fastening systems for Delhi Division', time: '10 hours ago', status: 'received' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.status === 'completed' || activity.status === 'passed' ? 'bg-green-500' :
                      activity.status === 'shipped' ? 'bg-blue-500' :
                      activity.status === 'updated' ? 'bg-yellow-500' : 'bg-purple-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.item}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.status === 'completed' || activity.status === 'passed' ? 'bg-green-100 text-green-800' :
                      activity.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      activity.status === 'updated' ? 'bg-yellow-100 text-yellow-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {activity.status.toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              // Original activity for admin/drm
              dashboardData?.inspections?.slice(0, 5).map((inspection: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      inspection.status === 'passed' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">Inspection: {inspection.productId}</p>
                      <p className="text-sm text-gray-600">By {inspection.inspectorName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      inspection.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {inspection.status.toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{inspection.date?.toLocaleDateString()}</p>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No recent inspections</p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;