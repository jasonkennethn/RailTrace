import React, { useState } from 'react';
import { FileSpreadsheet, Download, Calendar, Filter, BarChart3, PieChart, TrendingUp, Users, Star, CheckCircle, AlertTriangle } from 'lucide-react';
import ChartContainer from '../components/charts/ChartContainer';

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('user-activity');
  const [dateRange, setDateRange] = useState<string>('30days');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');

  const reportTypes = [
    { id: 'user-activity', name: 'User Activity', icon: Users },
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

  const generateReport = () => {
    // Create empty data structure for the remaining report types
    const reportData = {
      'user-activity': { data: [] },
      'manufacturer-performance': { data: [] },
      'delivery-usage': { data: [] }
    };

    const data = reportData[selectedReport as keyof typeof reportData] || { data: [] };
    const csvContent = 'No data available for the selected report type';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport}-report.csv`;
    a.click();
  };

  const renderReportContent = () => {
    const sampleData = {
      'user-activity': {
        charts: [
          {
            type: 'bar' as const,
            title: 'Daily User Activity',
            data: [
              { name: 'Mon', value: 45 },
              { name: 'Tue', value: 52 },
              { name: 'Wed', value: 48 },
              { name: 'Thu', value: 61 },
              { name: 'Fri', value: 55 },
              { name: 'Sat', value: 28 },
              { name: 'Sun', value: 32 }
            ]
          },
          {
            type: 'line' as const,
            title: 'User Login Trends',
            data: [
              { name: 'Week 1', value: 320 },
              { name: 'Week 2', value: 345 },
              { name: 'Week 3', value: 378 },
              { name: 'Week 4', value: 390 }
            ]
          }
        ]
      },
      'manufacturer-performance': {
        charts: [
          {
            type: 'pie' as const,
            title: 'Manufacturer Rating Distribution',
            data: [
              { name: 'Excellent (90-100)', value: 35 },
              { name: 'Good (80-89)', value: 40 },
              { name: 'Average (70-79)', value: 20 },
              { name: 'Poor (<70)', value: 5 }
            ]
          },
          {
            type: 'bar' as const,
            title: 'Top Manufacturers by Score',
            data: [
              { name: 'ABC Rails', value: 95 },
              { name: 'XYZ Components', value: 88 },
              { name: 'Steel Works Ltd', value: 85 },
              { name: 'Track Solutions', value: 82 },
              { name: 'Metro Parts', value: 78 }
            ]
          }
        ]
      },
      'delivery-usage': {
        charts: [
          {
            type: 'line' as const,
            title: 'Monthly Delivery Trends',
            data: [
              { name: 'Jan', value: 1200 },
              { name: 'Feb', value: 1350 },
              { name: 'Mar', value: 1280 },
              { name: 'Apr', value: 1450 },
              { name: 'May', value: 1520 },
              { name: 'Jun', value: 1380 }
            ]
          },
          {
            type: 'bar' as const,
            title: 'Product Usage by Category',
            data: [
              { name: 'Rail Joints', value: 450 },
              { name: 'Sleepers', value: 320 },
              { name: 'Fasteners', value: 280 },
              { name: 'Signals', value: 180 },
              { name: 'Switches', value: 120 }
            ]
          }
        ]
      }
    };

    const currentData = sampleData[selectedReport as keyof typeof sampleData];
    
    if (!currentData) {
      return (
        <div className="text-center py-12">
          <FileSpreadsheet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No data available for the selected report type</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentData.charts.map((chart, index) => (
            <ChartContainer
              key={index}
              type={chart.type}
              data={chart.data}
              title={chart.title}
              height={300}
            />
          ))}
        </div>
        
        {/* Summary Statistics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Total Records</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-1">2,345</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Growth Rate</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-1">+12.5%</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-600">Average Score</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900 mt-1">87.3</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-600">Issues</span>
              </div>
              <p className="text-2xl font-bold text-red-900 mt-1">23</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reports & Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Generate comprehensive reports and analyze system performance</p>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
          <div className="flex items-end space-x-4">
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