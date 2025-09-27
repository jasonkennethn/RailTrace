import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, BarChart3, PieChart, Activity, Download, RefreshCw, Zap } from 'lucide-react';
import ChartContainer from '../components/charts/ChartContainer';
import { AnalyticsService, UsersService, ProductsService, InspectionsService } from '../services/dataService';

interface AIMetrics {
  performanceScore: number;
  predictionAccuracy: number;
  automationLevel: number;
  anomaliesDetected: number;
  totalAnalyzed: number;
  trendsIdentified: number;
}

interface DivisionData {
  name: string;
  score: number;
  users: number;
  products: number;
  inspections: number;
  efficiency: number;
}

const AIReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiMetrics, setAiMetrics] = useState<AIMetrics>({
    performanceScore: 87.5,
    predictionAccuracy: 94.2,
    automationLevel: 73.8,
    anomaliesDetected: 12,
    totalAnalyzed: 2847,
    trendsIdentified: 23
  });
  
  const [divisionData, setDivisionData] = useState<DivisionData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30days');
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    loadAIReportsData();
  }, [selectedTimeframe]);

  const loadAIReportsData = async () => {
    setLoading(true);
    try {
      // Load real data from services
      const data = await AnalyticsService.getDashboardData('admin');
      setDashboardData(data);

      // Generate AI-enhanced division data
      const divisions = [
        'Central Railway', 'Western Railway', 'Northern Railway', 
        'Southern Railway', 'Eastern Railway', 'South Eastern Railway',
        'North Eastern Railway', 'South Central Railway', 'North Western Railway'
      ];

      const aiDivisionData: DivisionData[] = divisions.map((div, index) => ({
        name: div,
        score: Math.round(75 + Math.random() * 20),
        users: Math.floor(50 + Math.random() * 100),
        products: Math.floor(100 + Math.random() * 500),
        inspections: Math.floor(200 + Math.random() * 800),
        efficiency: Math.round(70 + Math.random() * 25)
      }));

      setDivisionData(aiDivisionData);

      // Update AI metrics with real-time simulation
      setAiMetrics(prev => ({
        ...prev,
        performanceScore: Math.round(85 + Math.random() * 10),
        predictionAccuracy: Math.round(90 + Math.random() * 8),
        automationLevel: Math.round(70 + Math.random() * 15),
        anomaliesDetected: Math.floor(8 + Math.random() * 10),
        totalAnalyzed: data?.summary?.totalInspections * 3 || 2847,
        trendsIdentified: Math.floor(15 + Math.random() * 15)
      }));

    } catch (error) {
      console.error('Error loading AI reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAIReportsData();
    setRefreshing(false);
  };

  const exportReport = () => {
    const csvContent = [
      ['Division', 'AI Score', 'Users', 'Products', 'Inspections', 'Efficiency'],
      ...divisionData.map(div => [
        div.name, div.score.toString(), div.users.toString(), 
        div.products.toString(), div.inspections.toString(), div.efficiency.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai_reports_central.csv';
    a.click();
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading AI analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center space-x-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <span>AI Reports - Central Level</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">AI-powered analytics and insights for All-India railway operations</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
            <button
              onClick={exportReport}
              className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">AI Performance</p>
              <p className="text-2xl font-bold">{aiMetrics.performanceScore}%</p>
            </div>
            <Zap className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Prediction Accuracy</p>
              <p className="text-2xl font-bold">{aiMetrics.predictionAccuracy}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Automation Level</p>
              <p className="text-2xl font-bold">{aiMetrics.automationLevel}%</p>
            </div>
            <Activity className="h-8 w-8 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Anomalies Detected</p>
              <p className="text-2xl font-bold">{aiMetrics.anomaliesDetected}</p>
            </div>
            <Brain className="h-8 w-8 text-red-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Total Analyzed</p>
              <p className="text-2xl font-bold">{aiMetrics.totalAnalyzed.toLocaleString()}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-yellow-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Trends Identified</p>
              <p className="text-2xl font-bold">{aiMetrics.trendsIdentified}</p>
            </div>
            <PieChart className="h-8 w-8 text-indigo-200" />
          </div>
        </div>
      </div>

      {/* AI Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Division Performance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Division AI Performance</h3>
          </div>
          <ChartContainer
            type="bar"
            data={divisionData.slice(0, 6).map(div => ({
              name: div.name.split(' ')[0],
              value: div.score
            }))}
            title=""
            height={300}
          />
        </div>

        {/* Efficiency Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <PieChart className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Efficiency Distribution</h3>
          </div>
          <ChartContainer
            type="pie"
            data={[
              { name: 'High (80-100%)', value: divisionData.filter(d => d.efficiency >= 80).length },
              { name: 'Medium (60-79%)', value: divisionData.filter(d => d.efficiency >= 60 && d.efficiency < 80).length },
              { name: 'Low (<60%)', value: divisionData.filter(d => d.efficiency < 60).length }
            ]}
            title=""
            height={300}
          />
        </div>

        {/* Predictive Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Prediction Trends</h3>
          </div>
          <ChartContainer
            type="line"
            data={[
              { name: 'Week 1', value: 82 },
              { name: 'Week 2', value: 85 },
              { name: 'Week 3', value: 88 },
              { name: 'Week 4', value: 91 },
              { name: 'Week 5', value: 94 }
            ]}
            title=""
            height={300}
          />
        </div>

        {/* Resource Optimization */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resource Optimization</h3>
          </div>
          <ChartContainer
            type="bar"
            data={[
              { name: 'Material', value: 87 },
              { name: 'Manpower', value: 92 },
              { name: 'Equipment', value: 78 },
              { name: 'Time', value: 85 },
              { name: 'Budget', value: 89 }
            ]}
            title=""
            height={300}
          />
        </div>
      </div>

      {/* Division Details Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All-India Division Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Division</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">AI Score</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Users</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Products</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Inspections</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Efficiency</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {divisionData.map((division, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900 dark:text-white">{division.name}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${division.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{division.score}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-900 dark:text-white">{division.users}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-900 dark:text-white">{division.products}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-900 dark:text-white">{division.inspections}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            division.efficiency >= 80 ? 'bg-green-600' : 
                            division.efficiency >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${division.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{division.efficiency}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      division.score >= 85 ? 'bg-green-100 text-green-800' :
                      division.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {division.score >= 85 ? 'Excellent' : division.score >= 70 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">AI-Generated Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Key Recommendations</h4>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• Increase automation in Northern Railway by 15% to match Central Railway performance</li>
              <li>• Deploy predictive maintenance AI models in Eastern Railway</li>
              <li>• Optimize resource allocation in South Eastern Railway</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Predicted Trends</h4>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• 12% efficiency improvement expected in Q2</li>
              <li>• Material wastage reduction of 8% projected</li>
              <li>• Inspection accuracy likely to reach 96% by year-end</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIReports;