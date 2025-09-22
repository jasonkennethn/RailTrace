import { useState, useEffect, useMemo } from 'react';
import { geminiService, VendorAnalysis, DefectPrediction } from '../../config/gemini';
import { DynamicChart } from '../ui/DynamicChart';
import { PredictiveAnalytics } from './PredictiveAnalytics';
import { SmartAddressDisplay } from '../ui/SmartAddressDisplay';
import { ScrollableHeader } from '../ui/ScrollableHeader';
import { collection, doc, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface AIAnalyticsProps {
  onBack?: () => void;
}

export function AIAnalytics({ onBack }: AIAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'vendor' | 'predictive' | 'anomaly'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [vendorAnalysis, setVendorAnalysis] = useState<VendorAnalysis[]>([]);
  const [defectPredictions, setDefectPredictions] = useState<DefectPrediction[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [error, setError] = useState<string>('');
  // const [kpiLoading, setKpiLoading] = useState(false);

  // Real-time vendor KPI states (30-day windows)
  const [overallTrend, setOverallTrend] = useState<number[]>([]);
  const [qualityNow, setQualityNow] = useState<number>(0);
  // const [qualityTrend, setQualityTrend] = useState<number[]>([]);
  const [deliveryTrend, setDeliveryTrend] = useState<number[]>([]);
  const [complianceMet, setComplianceMet] = useState<number>(0);
  const [complianceNotMet, setComplianceNotMet] = useState<number>(0);
  const [radarLiveData, setRadarLiveData] = useState<{label: string; value: number;}[] | null>(null);
  

  useEffect(() => {
    const fetchAIData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Fetch vendor analysis data
        const vendorData = await geminiService.analyzeVendorPerformance([]);
        setVendorAnalysis(vendorData);
        
        // Fetch defect predictions
        const predictions = await geminiService.predictDefects([]);
        setDefectPredictions(predictions);
        
        // Simulate additional loading time for smooth UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error('Error fetching AI data:', error);
        setError('Failed to load AI analytics data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAIData();

    // Set up real-time data refresh every 30 seconds
    const interval = setInterval(() => {
      if (!isLoading) {
        fetchAIData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Subscribe vendor-specific KPIs and radar metrics
  useEffect(() => {
    if (!selectedVendor) return;
    // setKpiLoading(true);

    // metricsDaily: last 30 days - fields: overallScore, qualityIndex, deliveryReliability, complianceMet, complianceNotMet
    const metricsDailyRef = collection(db, 'vendors', selectedVendor, 'metricsDaily');
    const unsubDaily = onSnapshot(
      query(metricsDailyRef, orderBy('date', 'asc'), limit(30)),
      (snap) => {
        const overall: number[] = [];
        const q: number[] = [];
        const d: number[] = [];
        let lastMet = 0; let lastNotMet = 0;
        snap.forEach(doc => {
          const data: any = doc.data();
          overall.push(Number(data.overallScore) || 0);
          q.push(Number(data.qualityIndex) || 0);
          d.push(Number(data.deliveryReliability) || 0);
          lastMet = Number(data.complianceMet ?? lastMet);
          lastNotMet = Number(data.complianceNotMet ?? lastNotMet);
        });
        setOverallTrend(overall);
        // setQualityTrend(q);
        setDeliveryTrend(d);
        setComplianceMet(lastMet);
        setComplianceNotMet(lastNotMet);
        // setKpiLoading(false);
      },
      () => {}
    );

    // metricsCurrent: latest snapshot of indices
    const metricsCurrentRef = doc(db, 'vendors', selectedVendor, 'metrics', 'current');
    const unsubCurrent = onSnapshot(metricsCurrentRef, (snap) => {
      const data: any = snap.data() || {};
      setQualityNow(Number(data.qualityIndex) || 0);
      if (Array.isArray(data.radar)) {
        // expected format: [{label:'Quality', value: 92}, ...]
        setRadarLiveData(data.radar.map((r: any) => ({ label: String(r.label), value: Number(r.value) })));
      }
    });

    return () => {
      unsubDaily();
      unsubCurrent();
    };
  }, [selectedVendor]);


  const handleRefresh = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Fetch fresh vendor analysis data
      const vendorData = await geminiService.analyzeVendorPerformance([]);
      setVendorAnalysis(vendorData);
      
      // Fetch fresh defect predictions
      const predictions = await geminiService.predictDefects([]);
      setDefectPredictions(predictions);
      
      // Simulate loading time for smooth UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error('Error refreshing AI data:', error);
      setError('Failed to refresh AI analytics data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedVendorData = () => {
    if (!selectedVendor) return vendorAnalysis[0] || null;
    return vendorAnalysis.find(v => v.vendorId === selectedVendor) || vendorAnalysis[0] || null;
  };

  const getHighRiskPredictions = () => {
    return defectPredictions.filter(p => p.probabilityScore > 0.7);
  };

  // Generate consistent blockchain addresses for high risk predictions
  const generateBlockchainAddress = (partId: string) => {
    // Create a deterministic address based on partId
    const hash = partId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `0x${hex}${'0'.repeat(32)}`;
  };

  // Generate real-time chart data
  const generateVendorPerformanceData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      x: index,
      y: 85 + Math.sin(index * 0.5) * 10 + Math.random() * 5,
      label: month,
      value: Math.round(85 + Math.sin(index * 0.5) * 10 + Math.random() * 5)
    }));
  };

  const generatePredictiveData = () => {
    const months = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'];
    return months.map((month, index) => ({
      x: index,
      y: 15 + Math.sin(index * 0.3) * 8 + Math.random() * 3,
      label: month,
      value: Math.round(15 + Math.sin(index * 0.3) * 8 + Math.random() * 3)
    }));
  };

  const generateAnomalyData = () => {
    const hours = ['14:30', '18:30', '22:30', '02:30', '06:30', '10:30'];
    return hours.map((hour, index) => ({
      x: index,
      y: 80 + Math.sin(index * 0.8) * 20 + Math.random() * 10,
      label: hour,
      value: Math.round(80 + Math.sin(index * 0.8) * 20 + Math.random() * 10)
    }));
  };

  const generateRadarData = () => {
    if (radarLiveData && radarLiveData.length) {
      return radarLiveData.map((m, index) => ({ x: index, y: m.value, label: m.label, value: m.value }));
    }
    const metrics = ['Quality', 'Delivery', 'Cost', 'Compliance', 'Responsiveness'];
    return metrics.map((metric, index) => ({ x: index, y: 80 + Math.random() * 20, label: metric, value: Math.round(80 + Math.random() * 20) }));
  };

  // Micro-viz builders
  const overallSparkPath = useMemo(() => {
    if (!overallTrend || overallTrend.length < 2) return '';
    const max = Math.max(...overallTrend);
    const min = Math.min(...overallTrend);
    const range = Math.max(1, max - min);
    return overallTrend.map((v, i) => {
      const x = (i / (overallTrend.length - 1)) * 100;
      const y = 28 - ((v - min) / range) * 26;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }, [overallTrend]);

  const deliveryBars = useMemo(() => {
    const source = deliveryTrend.length ? deliveryTrend.slice(-5) : [0,0,0,0,0];
    const max = Math.max(1, ...source);
    return source.map(v => Math.max(0, Math.min(100, Math.round((v / max) * 100))));
  }, [deliveryTrend]);

  const complianceTotal = Math.max(1, complianceMet + complianceNotMet);
  const complianceMetPct = Math.round((complianceMet / complianceTotal) * 100);
  const complianceNotMetPct = 100 - complianceMetPct;

  // Overview Section - Exact from admin_dashboard/code.html
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
      <div>
          <h1 className="text-2xl font-bold text-[#0d1117] dark:text-[#c9d1d9]">AI Analytics</h1>
          <p className="text-[#57606a] dark:text-[#8b949e]">Intelligent insights for railway operations</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-[#1773cf] text-white rounded-lg hover:bg-[#1773cf]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Refreshing...
            </>
          ) : (
            'Refresh Data'
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500">error</span>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* High Risk Alerts - Mobile Optimized */}
      {getHighRiskPredictions().length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 sm:p-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500">warning</span>
              <h3 className="font-semibold text-red-700 dark:text-red-300">High Risk Predictions</h3>
            </div>
            <div className="sm:ml-auto">
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
                {getHighRiskPredictions().length} Critical
              </span>
            </div>
          </div>
          <div className="space-y-3 max-w-full overflow-hidden">
            {getHighRiskPredictions().slice(0, 3).map((prediction, index) => (
              <div key={index} className="w-full max-w-full overflow-hidden">
                <div className="bg-white dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800 p-3 w-full max-w-full overflow-hidden">
                  {/* Header with Part ID and Risk Score */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-500">warning</span>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">
                        {prediction.partId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-700 dark:text-red-300">
                        {(prediction.probabilityScore * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">Risk Score</p>
                    </div>
                  </div>

                  {/* Smart Address Display */}
                  <div className="mb-3">
                    <SmartAddressDisplay
                      address={generateBlockchainAddress(prediction.partId)}
                      variant="compact"
                      maxLength={4}
        />
      </div>

                  {/* Time to Failure */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-red-500 text-sm">schedule</span>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Estimated failure: <span className="font-medium">{prediction.timeToFailure}</span>
                    </p>
                  </div>

                  {/* Recommended Action */}
                  <div className="bg-red-100 dark:bg-red-900/30 rounded-md p-2">
                    <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                      <span className="font-medium">Action Required:</span> {prediction.recommendedAction}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Cards - Mobile First Design */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div 
          onClick={() => setActiveTab('vendor')}
          className="bg-[#ffffff] dark:bg-[#161b22] rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer touch-target active:scale-95"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base sm:text-lg font-bold">Vendor Performance</h2>
              <span className="material-symbols-outlined text-[#57606a] dark:text-[#8b949e] text-lg sm:text-xl">arrow_forward_ios</span>
            </div>
          </div>
          <div className="h-64 sm:h-80 px-3 sm:px-4 pb-3 sm:pb-4 relative">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1773cf] mx-auto mb-2"></div>
                  <p className="text-sm text-[#57606a] dark:text-[#8b949e]">Loading Chart...</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full">
                <DynamicChart
                  data={generateVendorPerformanceData()}
                  type="line"
                  width={400}
                  height={200}
                  color="var(--chart-success)"
                  gradientId="vendorGradient1"
                  showPoints={true}
                  showGrid={true}
                  className="w-full h-full"
                />
              </div>
            )}
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('predictive')}
          className="bg-[#ffffff] dark:bg-[#161b22] rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer touch-target active:scale-95"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base sm:text-lg font-bold">Predictive Maintenance</h2>
              <span className="material-symbols-outlined text-[#57606a] dark:text-[#8b949e] text-lg sm:text-xl">arrow_forward_ios</span>
            </div>
          </div>
          <div className="h-64 sm:h-80 px-3 sm:px-4 pb-3 sm:pb-4 relative">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1773cf] mx-auto mb-2"></div>
                  <p className="text-sm text-[#57606a] dark:text-[#8b949e]">Loading Chart...</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full">
                <DynamicChart
                  data={generatePredictiveData()}
                  type="bar"
                  width={400}
                  height={200}
                  color="var(--chart-primary)"
                  gradientId="predictiveGradient"
                  showPoints={false}
                  showGrid={true}
                  className="w-full h-full"
                />
              </div>
            )}
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('anomaly')}
          className="bg-[#ffffff] dark:bg-[#161b22] rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer touch-target active:scale-95"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base sm:text-lg font-bold">Anomaly Detection</h2>
              <span className="material-symbols-outlined text-[#57606a] dark:text-[#8b949e] text-lg sm:text-xl">arrow_forward_ios</span>
            </div>
          </div>
          <div className="h-64 sm:h-80 px-3 sm:px-4 pb-3 sm:pb-4 relative">
          {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1773cf] mx-auto mb-2"></div>
                  <p className="text-sm text-[#57606a] dark:text-[#8b949e]">Loading Chart...</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full">
                <DynamicChart
                  data={generateAnomalyData()}
                  type="line"
                  width={400}
                  height={200}
                  color="var(--chart-danger)"
                  gradientId="anomalyGradient"
                  showPoints={true}
                  showGrid={true}
                  className="w-full h-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Vendor Analysis Section - Exact from robo.html
  const renderVendorAnalysis = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={onBack || (() => setActiveTab('overview'))} 
          className="touch-target text-[#57606a] dark:text-[#8b949e]"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-2xl font-bold">Vendor Analysis</h2>
      </div>

      {/* Vendor Selector */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#57606a] dark:text-[#8b949e]">storefront</span>
        <select 
          value={selectedVendor}
          onChange={(e) => setSelectedVendor(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-[#ffffff] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg focus:ring-2 focus:ring-[#1773cf] focus:border-[#1773cf] appearance-none"
        >
          <option value="">Select Vendor</option>
          {vendorAnalysis.map((vendor) => (
            <option key={vendor.vendorId} value={vendor.vendorId}>
              {vendor.vendorName}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#57606a] dark:text-[#8b949e] pointer-events-none">expand_more</span>
      </div>

      {/* Vendor Scorecard with micro-visualizations (Stitch AI style) */}
      <div className="bg-[#ffffff] dark:bg-[#161b22] rounded-xl shadow-md border border-[#d0d7de] dark:border-[#30363d] p-4">
        <h3 className="font-semibold text-lg text-[#0d1117] dark:text-[#c9d1d9] mb-4">Vendor Scorecard</h3>
        {(() => {
          const vendorData = getSelectedVendorData();
          return vendorData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Overall AI Score + sparkline */}
              <div className="rounded-lg border border-[#d0d7de] dark:border-[#30363d] p-3">
                <p className="text-xs text-[#57606a] dark:text-[#8b949e]">Overall AI Score</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold">{vendorData.score}</p>
                  <div className="flex items-center text-xs" style={{ color: 'var(--color-success)' }}>
                    <span className="material-symbols-outlined text-base">arrow_upward</span>
                    <span>+2.5</span>
                  </div>
                </div>
                <div className="mt-2 h-8">
                  <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="overallGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {overallSparkPath ? (
                      <>
                        <path d={overallSparkPath} fill="none" stroke="var(--color-primary)" strokeWidth="1.5" />
                        <path d={`${overallSparkPath} L 100 30 L 0 30 Z`} fill="url(#overallGrad)" />
                      </>
                    ) : (
                      <rect x="0" y="14" width="100" height="2" fill="var(--color-border)" />
                    )}
                  </svg>
                </div>
              </div>

              {/* Quality Index + semi-circle gauge */}
              <div className="rounded-lg border border-[#d0d7de] dark:border-[#30363d] p-3">
                <p className="text-xs text-[#57606a] dark:text-[#8b949e]">Quality Index</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-2xl font-bold">{Math.round(qualityNow)}%</p>
                  <svg width="56" height="28" viewBox="0 0 36 18">
                    <path d="M2 16 A 16 16 0 0 1 34 16" fill="none" stroke="var(--color-border)" strokeWidth="3" />
                    {(() => {
                      const pct = Math.max(0, Math.min(100, Math.round(qualityNow)));
                      const dash = (Math.PI * 16) * (pct / 100);
                      const color = pct >= 85 ? 'var(--color-success)' : pct >= 70 ? 'var(--color-warning)' : 'var(--color-danger)';
                      return (
                        <path d="M2 16 A 16 16 0 0 1 34 16" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${dash} ${Math.PI*16}`} />
                      );
                    })()}
                  </svg>
                </div>
              </div>

              {/* Delivery Reliability + mini bars */}
              <div className="rounded-lg border border-[#d0d7de] dark:border-[#30363d] p-3">
                <p className="text-xs text-[#57606a] dark:text-[#8b949e]">Delivery Reliability</p>
                <div className="mt-1 text-2xl font-bold">{deliveryTrend.length ? Math.round(deliveryTrend[deliveryTrend.length-1]) : 0}%</div>
                <div className="mt-2 flex items-end gap-1 h-10">
                  {deliveryBars.map((h, i) => (
                    <div key={i} className={`flex-1 rounded-sm relative overflow-hidden`} style={{ height: '100%', backgroundColor: 'var(--color-border)' }}>
                      <div className="absolute bottom-0 left-0 right-0" style={{ height: `${h}%`, backgroundColor: 'var(--color-secondary)' }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Adherence + stacked bar */}
              <div className="rounded-lg border border-[#d0d7de] dark:border-[#30363d] p-3">
                <p className="text-xs text-[#57606a] dark:text-[#8b949e]">Compliance Adherence</p>
                <div className="mt-1 text-2xl font-bold">{complianceMetPct}%</div>
                <div className="mt-2 h-3 w-full rounded-full overflow-hidden flex" style={{ backgroundColor: 'var(--color-border)' }}>
                  <div style={{ width: `${complianceMetPct}%`, backgroundColor: 'var(--color-success)' }} />
                  <div style={{ width: `${complianceNotMetPct}%`, backgroundColor: 'var(--color-danger)' }} />
                </div>
                <p className="mt-1 text-[11px] text-[#57606a] dark:text-[#8b949e]">Met {complianceMet} · Not Met {complianceNotMet}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1773cf] mx-auto mb-4"></div>
              <p className="text-[#57606a] dark:text-[#8b949e]">Loading vendor data...</p>
            </div>
          );
        })()}
      </div>

      {/* Vendor Performance Radar Chart */}
      <div className="bg-[#ffffff] dark:bg-[#161b22] rounded-xl shadow-md border border-[#d0d7de] dark:border-[#30363d]">
        <div className="p-4">
          <h3 className="font-semibold text-lg text-[#0d1117] dark:text-[#c9d1d9]">Vendor Performance Radar Chart</h3>
          <p className="text-sm text-[#57606a] dark:text-[#8b949e]">Jupiter Wagons Ltd. vs Industry Average</p>
        </div>
        <div className="px-4 pb-4">
          <div className="h-80 w-full">
            <DynamicChart
              data={generateRadarData()}
              type="radar"
              width={200}
              height={200}
              color="var(--chart-primary)"
              gradientId="radarGradient"
              showPoints={true}
              showGrid={true}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Key Risk Factors */}
      <div className="bg-[#ffffff] dark:bg-[#161b22] rounded-xl shadow-md border border-[#d0d7de] dark:border-[#30363d]">
        <div className="p-4">
          <h3 className="font-semibold text-lg text-[#0d1117] dark:text-[#c9d1d9]">Key Risk Factors</h3>
          <p className="text-sm text-[#57606a] dark:text-[#8b949e]">Identified potential issues</p>
        </div>
        <div className="px-4 pb-4 space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-[#0d1117] dark:text-[#c9d1d9]">Single Source Supplier</span>
              <span className="font-medium text-[#0d1117] dark:text-[#c9d1d9]">High</span>
            </div>
            <div className="w-full bg-[#f0f2f5] dark:bg-[#0d1117] rounded-full h-2.5">
              <div className="bg-red-500 h-2.5 rounded-full" style={{width: '85%'}}></div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-[#0d1117] dark:text-[#c9d1d9]">Price Volatility</span>
              <span className="font-medium text-[#0d1117] dark:text-[#c9d1d9]">Medium</span>
            </div>
            <div className="w-full bg-[#f0f2f5] dark:bg-[#0d1117] rounded-full h-2.5">
              <div className="bg-amber-500 h-2.5 rounded-full" style={{width: '55%'}}></div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-[#0d1117] dark:text-[#c9d1d9]">Geopolitical Instability</span>
              <span className="font-medium text-[#0d1117] dark:text-[#c9d1d9]">Low</span>
            </div>
            <div className="w-full bg-[#f0f2f5] dark:bg-[#0d1117] rounded-full h-2.5">
              <div className="bg-teal-500 h-2.5 rounded-full" style={{width: '20%'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div>
        <h2 className="text-lg font-semibold px-1 pb-4 pt-2 text-[#0d1117] dark:text-[#c9d1d9]">AI Recommendations</h2>
            <div className="space-y-4">
          <div className="bg-[#ffffff] dark:bg-[#161b22] rounded-lg p-4 shadow-sm border border-[#d0d7de] dark:border-[#30363d]">
            <div className="flex flex-col space-y-3">
              <p className="font-semibold text-base">Negotiate Long-Term Contract</p>
              <p className="text-sm text-[#57606a] dark:text-[#8b949e]">Mitigate price volatility risk by locking in current rates for critical components for the next 24 months.</p>
              <button className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#1773cf] rounded-lg hover:bg-[#1773cf]/90 focus:outline-none focus:ring-4 focus:ring-[#1773cf]/30 shadow-sm">
                Initiate Negotiation
              </button>
            </div>
          </div>
          <div className="bg-[#ffffff] dark:bg-[#161b22] rounded-lg p-4 shadow-sm border border-[#d0d7de] dark:border-[#30363d]">
            <div className="flex flex-col space-y-3">
              <p className="font-semibold text-base">Explore Secondary Supplier</p>
              <p className="text-sm text-[#57606a] dark:text-[#8b949e]">Identify and qualify an alternative supplier for axle bearings to reduce single-source dependency. Aim for 20% volume allocation.</p>
              <button className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#1773cf] rounded-lg hover:bg-[#1773cf]/90 focus:outline-none focus:ring-4 focus:ring-[#1773cf]/30 shadow-sm">
                Start Sourcing
              </button>
            </div>
          </div>
          <div className="bg-[#ffffff] dark:bg-[#161b22] rounded-lg p-4 shadow-sm border border-[#d0d7de] dark:border-[#30363d]">
            <div className="flex flex-col space-y-3">
              <p className="font-semibold text-base">Quarterly Business Review</p>
              <p className="text-sm text-[#57606a] dark:text-[#8b949e]">Schedule a QBR to discuss performance, address the slight dip in defect rate, and align on future quality improvement goals.</p>
              <button className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#1773cf] rounded-lg hover:bg-[#1773cf]/90 focus:outline-none focus:ring-4 focus:ring-[#1773cf]/30 shadow-sm">
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f0f2f5] dark:bg-[#0d1117] font-display text-[#0d1117] dark:text-[#c9d1d9] overflow-x-hidden">
      {/* Header with Hide-on-Scroll */}
      <ScrollableHeader>
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <img alt="Indian Railways Logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1twyRXwjo371pDweXtog1UaWqSMFJXQVnZVohBk0PsVJSEj76N2iW1J6rd0Mw_04zGsCl_zhvEhnDf5uXy6JBznCuYQ-LyIWa9-5htLX0TL7ABRV9Tcsms_zJn6-GaN9F342RJ9uiGrIrvqvWpK7MxycThUnhHocwJP-4uPF8DszWYIE9sNeiUrU2dJcS8KXPfbR8VDJhbE4-sTCEdNOUxU78z68xNmbwwUUNb8iN_vGBPfBlazj_SGU5K6F57ur4JcpKGInmVUc0"/>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#0d1117] dark:text-[#c9d1d9]">AI Analytics</h1>
              <p className="text-xs text-[#57606a] dark:text-[#8b949e]">
                {isLoading ? 'AI Processing...' : 'Powered by Gemini AI'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="px-3 py-1.5 text-sm bg-[#1773cf] text-white rounded-lg hover:bg-[#1773cf]/90 transition-colors hidden sm:flex"
            >
              Refresh AI
            </button>
            <button className="touch-target p-2">
              <img alt="User profile" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJlWuAbwR4MBLGiOvdbFImCEwktaEWt2XJK0RDhoAZbgfU8uZ_oEVA-Bxijr5Dr0wqMHayW2hCzHsqBf8MJ_RNWnhYscvsE5KhQJxKN9EqMiwEdQsplh4MzdawDNQUUq2IBn601rP4nDy9lv3EYr0WQM6HHp-tyZhOEbS5ZDxJKSVpqOE6NmxhOYYHYCi-HazAdFE7bg2dWMPzu1-w_GHyDudgTti4AtR25kjbuFDiu7vb9HhbraQi7mFe6aPonri-CnsTTDkfxWtT"/>
            </button>
          </div>
        </div>
      </ScrollableHeader>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto overflow-x-hidden">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'vendor' && renderVendorAnalysis()}
        {activeTab === 'predictive' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <button 
                onClick={onBack || (() => setActiveTab('overview'))} 
                className="touch-target text-[#57606a] dark:text-[#8b949e]"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h2 className="text-2xl font-bold">Predictive Analytics</h2>
            </div>

            {/* Predictive Analytics Component */}
            <PredictiveAnalytics />
          </div>
        )}
        {activeTab === 'anomaly' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <button 
                onClick={onBack || (() => setActiveTab('overview'))} 
                className="touch-target text-[#57606a] dark:text-[#8b949e]"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h2 className="text-2xl font-bold">Anomaly Details</h2>
            </div>

            {/* Anomaly Overview */}
            <section className="rounded-lg bg-[#ffffff] dark:bg-[#161b22] shadow-sm p-4">
              <h2 className="text-base font-bold text-[#0d1117] dark:text-[#c9d1d9] mb-3">Anomaly Overview</h2>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10 dark:bg-red-500/20">
                  <span className="material-symbols-outlined text-3xl text-red-500">dangerous</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#0d1117] dark:text-[#c9d1d9]">Track Circuit Failure</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-red-500"></span>
                    <p className="text-sm text-red-500 font-medium">Critical</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#57606a] dark:text-[#8b949e] mt-3">Detected: 2024-03-15 14:30 IST</p>
            </section>

            {/* Time Series Chart */}
            <section>
              <h2 className="text-base font-bold text-[#0d1117] dark:text-[#c9d1d9] px-4 mb-3">Time Series Chart</h2>
              <div className="rounded-lg bg-[#ffffff] dark:bg-[#161b22] shadow-sm p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-[#57606a] dark:text-[#8b949e]">Track Circuit Voltage</p>
                    <p className="text-3xl font-bold text-[#0d1117] dark:text-[#c9d1d9]">1.2V</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-red-500">
                    <span className="material-symbols-outlined text-base">arrow_downward</span>
                    <span>25%</span>
                  </div>
                </div>
                <p className="text-xs text-[#57606a] dark:text-[#8b949e] mb-4">Last 24 Hours</p>
                <div className="h-48">
                  <svg fill="none" height="100%" preserveAspectRatio="none" viewBox="0 0 472 150" width="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient gradientUnits="userSpaceOnUse" id="chartGradient" x1="0" x2="0" y1="0" y2="150">
                        <stop stopColor="#1773cf" stopOpacity="0.3"></stop>
                        <stop offset="1" stopColor="#1773cf" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="#1773cf" strokeLinecap="round" strokeWidth="2"></path>
                    <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V150H0V109Z" fill="url(#chartGradient)"></path>
                  </svg>
                </div>
                <div className="flex justify-between text-xs text-[#57606a] dark:text-[#8b949e] mt-2">
                  <span>12PM</span>
                  <span>6PM</span>
                  <span>12AM</span>
                  <span>6AM</span>
                </div>
              </div>
            </section>

            {/* Contributing Factors */}
            <section>
              <h2 className="text-base font-bold text-[#0d1117] dark:text-[#c9d1d9] px-4 mb-3">Contributing Factors</h2>
              <div className="rounded-lg bg-[#ffffff] dark:bg-[#161b22] shadow-sm p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <p className="w-2/5 text-sm text-[#57606a] dark:text-[#8b949e]">Sensor A</p>
                    <div className="w-3/5 bg-[#f0f2f5] dark:bg-[#0d1117] rounded-full h-2">
                      <div className="bg-[#1773cf] h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p className="w-2/5 text-sm text-[#57606a] dark:text-[#8b949e]">Sensor B</p>
                    <div className="w-3/5 bg-[#f0f2f5] dark:bg-[#0d1117] rounded-full h-2">
                      <div className="bg-[#1773cf] h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                      </div>
                  <div className="flex items-center">
                    <p className="w-2/5 text-sm text-[#57606a] dark:text-[#8b949e] truncate">Environmental Temp</p>
                    <div className="w-3/5 bg-[#f0f2f5] dark:bg-[#0d1117] rounded-full h-2">
                      <div className="bg-[#1773cf] h-2 rounded-full" style={{width: '20%'}}></div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p className="w-2/5 text-sm text-[#57606a] dark:text-[#8b949e]">Humidity</p>
                    <div className="w-3/5 bg-[#f0f2f5] dark:bg-[#0d1117] rounded-full h-2">
                      <div className="bg-[#1773cf] h-2 rounded-full" style={{width: '15%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Affected Parts/Systems */}
            <section>
              <h2 className="text-base font-bold text-[#0d1117] dark:text-[#c9d1d9] px-4 mb-3">Affected Parts/Systems</h2>
              <div className="rounded-lg bg-[#ffffff] dark:bg-[#161b22] shadow-sm p-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-[#57606a] dark:text-[#8b949e]">Track Circuit 123</p>
                  <p className="font-bold text-[#0d1117] dark:text-[#c9d1d9]">Signal System</p>
                  <p className="text-sm font-medium text-red-500">Status: Offline</p>
                </div>
                <img alt="Affected part image" className="w-20 h-20 object-cover rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbddXetMpqRArQY1fwcluOpYtPUWcWCgYRen9Xx7xLRWwJ5PElc7ItrkTdLLHTj2l6lF6mZrQRT7L7-Qhp94NVoW0TMg4ODkdq0YAMjzqG7D2LElLde72gv-QDReaZ_ps4ZO_KBdHCB0iL9DnhRyNx_Vil63u31vYwI_7WQ7xJ5Vd8exacmf_54VWuHthSGezKnlAPtUDv1A_asltKwTA9ZszJRUHwT-uQq1Nv-XrztDdEBI4nN3_eDLY4AUtSERup4-3Kh9Fx910M"/>
            </div>
            </section>

            {/* Suggested Actions */}
            <section>
              <h2 className="text-base font-bold text-[#0d1117] dark:text-[#c9d1d9] px-4 mb-3">Suggested Actions</h2>
              <div className="space-y-3">
                <div className="rounded-lg bg-[#ffffff] dark:bg-[#161b22] shadow-sm p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[#0d1117] dark:text-[#c9d1d9]">Inspect Track Circuit</p>
                    <p className="text-sm text-[#57606a] dark:text-[#8b949e]">Check for physical damage.</p>
                  </div>
                  <button className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#1773cf]/10 dark:bg-[#1773cf]/20 px-4 text-sm font-bold text-[#1773cf]">
                    <span>Execute</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
                <div className="rounded-lg bg-[#ffffff] dark:bg-[#161b22] shadow-sm p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[#0d1117] dark:text-[#c9d1d9]">Review Sensor Data</p>
                    <p className="text-sm text-[#57606a] dark:text-[#8b949e]">Analyze historical trends.</p>
                  </div>
                  <button className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#1773cf]/10 dark:bg-[#1773cf]/20 px-4 text-sm font-bold text-[#1773cf]">
                    <span>Execute</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-[#f0f2f5] dark:bg-[#161b22] text-[#0d1117] dark:text-[#c9d1d9] text-sm font-bold">
                <span className="material-symbols-outlined text-xl">description</span>
                <span>Generate Report</span>
              </button>
              <button className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-[#1773cf] text-white text-sm font-bold">
                <span className="material-symbols-outlined text-xl">check_circle</span>
                <span>Mark as Reviewed</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
