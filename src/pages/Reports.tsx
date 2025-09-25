import React, { useState } from 'react';
import { FileSpreadsheet, Download, Calendar, Filter, BarChart3, PieChart, TrendingUp, Users, Star, CheckCircle, AlertTriangle } from 'lucide-react';
import ChartContainer from '../components/charts/ChartContainer';

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('system-overview');
  const [dateRange, setDateRange] = useState<string>('30days');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');

  const reportTypes = [
    { id: 'system-overview', name: 'System Overview', icon: BarChart3 },
    { id: 'inspection-summary', name: 'Inspection Summary', icon: FileSpreadsheet },
    { id: 'vendor-performance', name: 'Vendor Performance', icon: TrendingUp },
    { id: 'user-activity', name: 'User Activity', icon: Users },
    { id: 'blockchain-audit', name: 'Blockchain Audit', icon: PieChart },
    { id: 'manufacturer-performance', name: 'Manufacturer Performance', icon: Star },
    { id: 'delivery-usage', name: 'Delivery & Usage', icon: TrendingUp }
  ];

  const divisions = [
    'Central Railway',
    'Western Railway',
    'Northern Railway',
    'Southern Railway',
    'Eastern Railway',
    'South Eastern Railway'
  ];

  const systemOverviewData = {
    inspections: [
      { name: 'Jan', value: 120 },
      { name: 'Feb', value: 98 },
      { name: 'Mar', value: 134 },
      { name: 'Apr', value: 156 },
      { name: 'May', value: 142 },
      { name: 'Jun', value: 178 }
    ],
    products: [
      { name: 'Rail Components', value: 45 },
      { name: 'Signaling Equipment', value: 25 },
      { name: 'Track Components', value: 20 },
      { name: 'Fastening Systems', value: 10 }
    ],
    performance: [
      { name: 'Week 1', value: 85 },
      { name: 'Week 2', value: 88 },
      { name: 'Week 3', value: 92 },
      { name: 'Week 4', value: 89 }
    ]
  };

  const inspectionSummaryData = {
    status: [
      { name: 'Passed', value: 156 },
      { name: 'Failed', value: 23 },
      { name: 'Pending', value: 12 }
    ],
    monthly: [
      { name: 'Jan', value: 45 },
      { name: 'Feb', value: 52 },
      { name: 'Mar', value: 48 },
      { name: 'Apr', value: 61 },
      { name: 'May', value: 55 },
      { name: 'Jun', value: 67 }
    ]
  };

  const vendorPerformanceData = {
    scores: [
      { name: 'Steel Works India', value: 94 },
      { name: 'Railway Electronics', value: 88 },
      { name: 'Precision Fasteners', value: 92 },
      { name: 'Concrete Solutions', value: 85 },
      { name: 'Advanced Rail Systems', value: 90 }
    ],
    trends: [
      { name: 'Q1', value: 87 },
      { name: 'Q2', value: 89 },
      { name: 'Q3', value: 91 },
      { name: 'Q4', value: 93 }
    ]
  };

  const generateReport = () => {
    const reportData = {
      'system-overview': systemOverviewData,
      'inspection-summary': inspectionSummaryData,
      'vendor-performance': vendorPerformanceData
    };

    const data = reportData[selectedReport as keyof typeof reportData] || systemOverviewData;
    const csvContent = Object.entries(data).map(([key, values]) => 
      [key, ...values.map((item: any) => `${item.name}: ${item.value}`)].join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport}-report.csv`;
    a.click();
  };

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'system-overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400">Total Inspections</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">828</p>
                  </div>
                  <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Products</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">System Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">456</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">94.2%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                type="bar"
                data={systemOverviewData.inspections}
                title="Monthly Inspections"
                height={300}
              />
              <ChartContainer
                type="pie"
                data={systemOverviewData.products}
                title="Product Distribution"
                height={300}
              />
            </div>
            <ChartContainer
              type="line"
              data={systemOverviewData.performance}
              title="Performance Trend"
              height={300}
            />
          </div>
        );

      case 'inspection-summary':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Passed Inspections</p>
                    <p className="text-2xl font-bold text-green-600">156</p>
                  </div>
                  <div className="bg-green-100 rounded-full p-2">
                    <FileSpreadsheet className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Failed Inspections</p>
                    <p className="text-2xl font-bold text-red-600">23</p>
                  </div>
                  <div className="bg-red-100 rounded-full p-2">
                    <FileSpreadsheet className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending Inspections</p>
                    <p className="text-2xl font-bold text-yellow-600">12</p>
                  </div>
                  <div className="bg-yellow-100 rounded-full p-2">
                    <FileSpreadsheet className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                type="pie"
                data={inspectionSummaryData.status}
                title="Inspection Status Distribution"
                height={300}
              />
              <ChartContainer
                type="bar"
                data={inspectionSummaryData.monthly}
                title="Monthly Inspection Trends"
                height={300}
              />
            </div>
          </div>
        );

      case 'vendor-performance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Vendor Score</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">89.8</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Top Performer</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">Steel Works India</p>
                    <p className="text-sm text-green-600">Score: 94</p>
                  </div>
                  <div className="bg-green-100 rounded-full p-2">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                type="bar"
                data={vendorPerformanceData.scores}
                title="Vendor Performance Scores"
                height={300}
              />
              <ChartContainer
                type="line"
                data={vendorPerformanceData.trends}
                title="Quarterly Performance Trends"
                height={300}
              />
            </div>
          </div>
        );

      case 'manufacturer-performance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">AI Performance Score</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">91.2</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Products Delivered</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">94%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Defect Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">2.1%</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                type="line"
                data={[
                  { name: 'Jan', value: 89 },
                  { name: 'Feb', value: 90 },
                  { name: 'Mar', value: 91 },
                  { name: 'Apr', value: 92 },
                  { name: 'May', value: 91 },
                  { name: 'Jun', value: 91 }
                ]}
                title="Monthly AI Performance Score"
                height={300}
              />
              <ChartContainer
                type="pie"
                data={[
                  { name: 'On Time', value: 94 },
                  { name: 'Delayed', value: 6 }
                ]}
                title="Delivery Performance"
                height={300}
              />
            </div>
          </div>
        );

      case 'delivery-usage':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Deliveries</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">456</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Product Usage</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">89%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Customer Satisfaction</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">4.7/5</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                type="bar"
                data={[
                  { name: 'Rail Components', value: 45 },
                  { name: 'Signaling Equipment', value: 25 },
                  { name: 'Track Components', value: 20 },
                  { name: 'Fastening Systems', value: 10 }
                ]}
                title="Product Usage by Category"
                height={300}
              />
              <ChartContainer
                type="line"
                data={[
                  { name: 'Jan', value: 42 },
                  { name: 'Feb', value: 38 },
                  { name: 'Mar', value: 45 },
                  { name: 'Apr', value: 48 },
                  { name: 'May', value: 52 },
                  { name: 'Jun', value: 56 }
                ]}
                title="Monthly Delivery Trends"
                height={300}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <FileSpreadsheet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Select a report type to view data</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reports & Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Generate comprehensive reports and analyze system performance</p>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {reportTypes.map(report => (
                <option key={report.id} value={report.id}>{report.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="relative">
              <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
            <div className="relative">
              <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Divisions</option>
                {divisions.map(division => (
                  <option key={division} value={division}>{division}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="lg:col-span-2 flex items-end space-x-4">
            <button
              onClick={generateReport}
              className="flex-1 bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors">
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Report Types Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex flex-wrap gap-2">
          {reportTypes.map((report) => {
            const IconComponent = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedReport === report.id
                    ? 'bg-blue-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span className="text-sm font-medium">{report.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Content */}
      <div className="min-h-[600px]">
        {renderReportContent()}
      </div>
    </div>
  );
};

export default Reports;