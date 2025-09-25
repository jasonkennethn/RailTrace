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
    switch (selectedReport) {
      default:
        return (
          <div className="text-center py-12">
            <FileSpreadsheet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No data available for the selected report type</p>
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