import React, { useState, useEffect } from 'react';
import { RefreshCw, Filter, TrendingUp } from 'lucide-react';
import { PredictiveCard } from '../ui/PredictiveCard';
import { MobileCarousel } from '../ui/MobileCarousel';
import { geminiService, DefectPrediction } from '../../config/gemini';

interface PredictiveData {
  id: string;
  title: string;
  address: string;
  predictivePercentage: number;
  maintenanceRecommendation: string;
  suggestedTimeline: string;
  status: 'critical' | 'warning' | 'normal';
  chartData: Array<{ x: number; y: number; label?: string; value?: number }>;
  chartType: 'line' | 'bar' | 'area';
  chartColor: string;
}

export function PredictiveAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [predictiveData, setPredictiveData] = useState<PredictiveData[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Generate sample predictive data
  const generatePredictiveData = (): PredictiveData[] => {
    const systems = [
      {
        title: 'Braking System',
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        chartColor: '#ef4444',
        chartType: 'line' as const
      },
      {
        title: 'Traction Motor',
        address: '0x8ba1f109551bD432803012645Hac136c4c4b8b8b',
        chartColor: '#f97316',
        chartType: 'bar' as const
      },
      {
        title: 'HVAC Unit',
        address: '0x9c4d35Cc6634C0532925a3b8D4C9db96C4b4d8b7',
        chartColor: '#1773cf',
        chartType: 'area' as const
      }
    ];

    return systems.map((system, index) => {
      const predictivePercentage = Math.floor(Math.random() * 40) + 60; // 60-100%
      const status = predictivePercentage > 85 ? 'critical' : predictivePercentage > 75 ? 'warning' : 'normal';
      
      // Generate chart data
      const chartData = Array.from({ length: 6 }, (_, i) => ({
        x: i,
        y: 20 + Math.sin(i * 0.5) * 15 + Math.random() * 10,
        label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
        value: Math.round(20 + Math.sin(i * 0.5) * 15 + Math.random() * 10)
      }));

      const recommendations = {
        critical: 'Immediate maintenance required. System showing signs of critical failure. Schedule emergency repair within 24 hours.',
        warning: 'Preventive maintenance recommended. Monitor system closely and schedule maintenance within 1-2 weeks.',
        normal: 'System operating within normal parameters. Continue regular monitoring and schedule routine maintenance.'
      };

      const timelines = {
        critical: '24-48 hours',
        warning: '1-2 weeks',
        normal: '1-2 months'
      };

      return {
        id: `system-${index}`,
        title: system.title,
        address: system.address,
        predictivePercentage,
        maintenanceRecommendation: recommendations[status],
        suggestedTimeline: timelines[status],
        status,
        chartData,
        chartType: system.chartType,
        chartColor: system.chartColor
      };
    });
  };

  useEffect(() => {
    const fetchPredictiveData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate predictive data
        const data = generatePredictiveData();
        setPredictiveData(data);
        
      } catch (error) {
        console.error('Error fetching predictive data:', error);
        setError('Failed to load predictive analytics data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictiveData();

    // Set up real-time data refresh every 30 seconds
    const interval = setInterval(() => {
      if (!isLoading) {
        fetchPredictiveData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = generatePredictiveData();
      setPredictiveData(data);
    } catch (error) {
      console.error('Error refreshing predictive data:', error);
      setError('Failed to refresh predictive analytics data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = predictiveData.filter(item => {
    if (selectedFilter === 'all') return true;
    return item.status === selectedFilter;
  });

  if (isLoading && predictiveData.length === 0) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#0d1117] p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1773cf] mx-auto mb-4"></div>
              <p className="text-[#57606a] dark:text-[#8b949e]">Loading predictive analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#0d1117] p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0d1117] dark:text-[#c9d1d9]">
              Predictive Analytics
            </h1>
            <p className="text-[#57606a] dark:text-[#8b949e] mt-1">
              AI-powered maintenance predictions and system health monitoring
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-[#1773cf] text-white rounded-lg hover:bg-[#1773cf]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 touch-target"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-red-500">⚠️</span>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-[#57606a] dark:text-[#8b949e]" />
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All Systems', count: predictiveData.length },
              { value: 'critical', label: 'Critical', count: predictiveData.filter(d => d.status === 'critical').length },
              { value: 'warning', label: 'Warning', count: predictiveData.filter(d => d.status === 'warning').length },
              { value: 'normal', label: 'Normal', count: predictiveData.filter(d => d.status === 'normal').length }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-target ${
                  selectedFilter === filter.value
                    ? 'bg-[#1773cf] text-white'
                    : 'bg-[#ffffff] dark:bg-[#161b22] text-[#57606a] dark:text-[#8b949e] hover:bg-[#f0f2f5] dark:hover:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d]'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Layout - 3 cards side by side */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {filteredData.map((data) => (
            <PredictiveCard
              key={data.id}
              title={data.title}
              address={data.address}
              predictivePercentage={data.predictivePercentage}
              maintenanceRecommendation={data.maintenanceRecommendation}
              suggestedTimeline={data.suggestedTimeline}
              status={data.status}
              chartData={data.chartData}
              chartType={data.chartType}
              chartColor={data.chartColor}
            />
          ))}
        </div>

        {/* Mobile Layout - Carousel */}
        <div className="lg:hidden">
          <MobileCarousel
            showIndicators={true}
            showNavigation={false}
            className="w-full"
          >
            {filteredData.map((data) => (
              <PredictiveCard
                key={data.id}
                title={data.title}
                address={data.address}
                predictivePercentage={data.predictivePercentage}
                maintenanceRecommendation={data.maintenanceRecommendation}
                suggestedTimeline={data.suggestedTimeline}
                status={data.status}
                chartData={data.chartData}
                chartType={data.chartType}
                chartColor={data.chartColor}
                className="mx-2"
              />
            ))}
          </MobileCarousel>
        </div>

        {/* Tablet Layout - 2 cards side by side */}
        <div className="hidden md:grid md:grid-cols-2 lg:hidden gap-6">
          {filteredData.map((data) => (
            <PredictiveCard
              key={data.id}
              title={data.title}
              address={data.address}
              predictivePercentage={data.predictivePercentage}
              maintenanceRecommendation={data.maintenanceRecommendation}
              suggestedTimeline={data.suggestedTimeline}
              status={data.status}
              chartData={data.chartData}
              chartType={data.chartType}
              chartColor={data.chartColor}
            />
          ))}
        </div>

        {/* Summary Stats */}
        <div className="bg-[#ffffff] dark:bg-[#161b22] rounded-xl shadow-sm border border-[#d0d7de] dark:border-[#30363d] p-6">
          <h3 className="text-lg font-semibold text-[#0d1117] dark:text-[#c9d1d9] mb-4">
            System Health Overview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#0d1117] dark:text-[#c9d1d9]">
                {predictiveData.length}
              </div>
              <div className="text-sm text-[#57606a] dark:text-[#8b949e]">Total Systems</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {predictiveData.filter(d => d.status === 'critical').length}
              </div>
              <div className="text-sm text-[#57606a] dark:text-[#8b949e]">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-500">
                {predictiveData.filter(d => d.status === 'warning').length}
              </div>
              <div className="text-sm text-[#57606a] dark:text-[#8b949e]">Warning</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {predictiveData.filter(d => d.status === 'normal').length}
              </div>
              <div className="text-sm text-[#57606a] dark:text-[#8b949e]">Normal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
