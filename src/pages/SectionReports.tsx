import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, MapPin, CheckCircle, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import ChartContainer from '../components/charts/ChartContainer';
import { aiService } from '../services/aiService';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';

const SectionReports: React.FC = () => {
  const { theme } = useTheme();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [aiInsights, setAiInsights] = useState<any>(null);

  useEffect(() => {
    generateSectionReport();
  }, [selectedPeriod]);

  const generateSectionReport = async () => {
    setLoading(true);
    try {
      // Mock data for section reports
      const mockData = {
        sectionStatus: [
          { name: 'Section A-123', value: 95 },
          { name: 'Section B-456', value: 88 },
          { name: 'Section C-789', value: 92 },
          { name: 'Section D-012', value: 85 },
          { name: 'Section E-345', value: 90 }
        ],
        inspectionTrends: [
          { name: 'Jan', inspections: 45, completed: 42 },
          { name: 'Feb', inspections: 38, completed: 36 },
          { name: 'Mar', inspections: 52, completed: 48 },
          { name: 'Apr', inspections: 48, completed: 45 },
          { name: 'May', inspections: 55, completed: 52 },
          { name: 'Jun', inspections: 60, completed: 57 }
        ],
        productUsage: [
          { name: 'Rail Joints', value: 120 },
          { name: 'Track Bolts', value: 450 },
          { name: 'Sleepers', value: 280 },
          { name: 'Fasteners', value: 680 }
        ],
        maintenanceStatus: [
          { name: 'Completed', value: 78 },
          { name: 'In Progress', value: 15 },
          { name: 'Scheduled', value: 12 },
          { name: 'Overdue', value: 3 }
        ]
      };

      // Get AI insights
      const insights = await aiService.generateInspectionInsights([
        { status: 'passed', productId: 'RJ-001', location: 'Section A-123' },
        { status: 'failed', productId: 'TB-002', location: 'Section B-456' },
        { status: 'passed', productId: 'SL-003', location: 'Section C-789' }
      ]);

      setReportData(mockData);
      setAiInsights(insights);
    } catch (error) {
      console.error('Error generating section report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Sections', '5'],
      ['Average Performance', '90.0'],
      ['Total Inspections', '298'],
      ['Completion Rate', '95.3%']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'section-report.csv';
    a.click();
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-dark-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-dark-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Section Reports
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track inspection status and product usage in assigned sections
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={generateSectionReport}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={exportReport}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sections</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">5</p>
            </div>
            <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Performance</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">90.0%</p>
            </div>
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Inspections</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">298</p>
            </div>
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI Score</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {aiInsights?.overallScore || 88}
              </p>
            </div>
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <ChartContainer
          type="bar"
          data={reportData?.sectionStatus || []}
          title="Section Performance Status"
          height={300}
        />
        <ChartContainer
          type="pie"
          data={reportData?.maintenanceStatus || []}
          title="Maintenance Status Distribution"
          height={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <ChartContainer
          type="line"
          data={reportData?.inspectionTrends?.map((item: any) => ({ name: item.name, value: item.completed })) || []}
          title="Inspection Completion Trends"
          height={300}
        />
        <ChartContainer
          type="bar"
          data={reportData?.productUsage || []}
          title="Product Usage by Section"
          height={300}
        />
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary-600" />
            AI Section Analysis
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Performance Trends</h4>
              <ul className="space-y-2">
                {aiInsights.trends?.map((trend: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{trend}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Section Alerts</h4>
              <ul className="space-y-2">
                {aiInsights.alerts?.map((alert: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{alert}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {aiInsights.predictions?.map((prediction: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{prediction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionReports;