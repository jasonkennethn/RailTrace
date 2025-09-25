import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle, AlertTriangle, Star, FileSpreadsheet, Download } from 'lucide-react';
import ChartContainer from '../components/charts/ChartContainer';
import { aiService } from '../services/aiService';

const DivisionReports: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  useEffect(() => {
    generateDivisionReport();
  }, [selectedPeriod]);

  const generateDivisionReport = async () => {
    setLoading(true);
    try {
      // Simulate API call for division data
      const mockData = {
        inspectionStatus: [
          { name: 'Completed', value: 156 },
          { name: 'In Progress', value: 23 },
          { name: 'Pending', value: 12 },
          { name: 'Failed', value: 8 }
        ],
        productUsage: [
          { name: 'Rail Joints', value: 450 },
          { name: 'Track Bolts', value: 1200 },
          { name: 'Sleepers', value: 800 },
          { name: 'Fasteners', value: 2000 }
        ],
        manufacturerRatings: [
          { name: 'Steel Works India', value: 94 },
          { name: 'Railway Electronics', value: 88 },
          { name: 'Precision Fasteners', value: 92 },
          { name: 'Concrete Solutions', value: 85 }
        ],
        monthlyTrends: [
          { name: 'Jan', inspections: 120, products: 450 },
          { name: 'Feb', inspections: 98, products: 380 },
          { name: 'Mar', inspections: 134, products: 520 },
          { name: 'Apr', inspections: 156, products: 600 },
          { name: 'May', inspections: 142, products: 580 },
          { name: 'Jun', inspections: 178, products: 650 }
        ]
      };

      // Get AI insights
      const aiInsights = await aiService.generateInspectionInsights([
        { status: 'passed', productId: 'RJ-001', location: 'Section A' },
        { status: 'failed', productId: 'TB-002', location: 'Section B' },
        { status: 'passed', productId: 'SL-003', location: 'Section C' }
      ]);

      setReportData({ ...mockData, aiInsights });
    } catch (error) {
      console.error('Error generating division report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Inspections', '199'],
      ['Completed Inspections', '156'],
      ['Average Manufacturer Rating', '89.8'],
      ['Product Usage (Total)', '4450']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'division-report.csv';
    a.click();
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Division Reports</h1>
        <p className="text-gray-600">Comprehensive division-level analytics and performance metrics</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <button
            onClick={exportReport}
            className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Inspections</p>
              <p className="text-2xl font-bold text-gray-900">199</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">78.4%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Manufacturer Rating</p>
              <p className="text-2xl font-bold text-gray-900">89.8</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">AI Insights Score</p>
              <p className="text-2xl font-bold text-gray-900">{reportData?.aiInsights?.overallScore || 85}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartContainer
          type="pie"
          data={reportData?.inspectionStatus || []}
          title="Inspection Status Distribution"
          height={300}
        />
        <ChartContainer
          type="bar"
          data={reportData?.manufacturerRatings || []}
          title="Manufacturer Performance Ratings"
          height={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartContainer
          type="bar"
          data={reportData?.productUsage || []}
          title="Product Usage Summary"
          height={300}
        />
        <ChartContainer
          type="line"
          data={reportData?.monthlyTrends?.map((item: any) => ({ name: item.name, value: item.inspections })) || []}
          title="Monthly Inspection Trends"
          height={300}
        />
      </div>

      {/* AI Insights */}
      {reportData?.aiInsights && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
            AI Performance Insights
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Key Trends</h4>
              <ul className="space-y-2">
                {reportData.aiInsights.trends?.map((trend: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-sm text-gray-700">{trend}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Alerts</h4>
              <ul className="space-y-2">
                {reportData.aiInsights.alerts?.map((alert: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span className="text-sm text-gray-700">{alert}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Predictions</h4>
              <ul className="space-y-2">
                {reportData.aiInsights.predictions?.map((prediction: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm text-gray-700">{prediction}</span>
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

export default DivisionReports;