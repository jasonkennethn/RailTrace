import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Truck,
  Eye,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Maximize2,
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import VendorFooterNav from '../VendorPages/VendorFooterNav';
import { vendorDataService } from '../../services/vendorDataService';
import { Modal } from '../ui/Modal';

const COLORS = ['var(--color-primary)', 'var(--chart-success)', 'var(--chart-warning)', 'var(--chart-danger)', 'var(--color-accent)'];

interface VendorStats {
  totalBatches: number;
  pendingShipments: number;
  completedShipments: number;
  qrCodesGenerated: number;
  blockchainRecords: number;
}

interface BatchData {
  id: string;
  batchNumber: string;
  fittingType: string;
  quantity: number;
  status: 'manufacturing' | 'ready' | 'shipped' | 'delivered';
  createdAt: Date;
  expectedDelivery: Date;
}

interface ShipmentData {
  id: string;
  batchId: string;
  destination: string;
  status: 'pending' | 'in_transit' | 'delivered';
  trackingNumber: string;
  createdAt: Date;
}

export function VendorDashboard() {
  const { userData } = useAuth();
  const vendorId = (userData as any)?.vendorId || (userData as any)?.uid || 'default';
  const [stats, setStats] = useState<VendorStats>({
    totalBatches: 0,
    pendingShipments: 0,
    completedShipments: 0,
    qrCodesGenerated: 0,
    blockchainRecords: 0
  });
  const [batches, setBatches] = useState<BatchData[]>([]);
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  type PerformancePoint = { label: string; batches?: number; shipments?: number; quality?: number };
  const [performanceData, setPerformanceData] = useState<PerformancePoint[]>([]);
  const [fittingTypeData, setFittingTypeData] = useState<Array<{ name: string; value: number; count?: number }>>([]);

  // Full-screen performance modal
  const [perfOpen, setPerfOpen] = useState(false);

  // Stitch-style fallback datasets (used only when live arrays are empty)
  const fallbackPerformanceData: PerformancePoint[] = [
    { label: 'D1', batches: 12, shipments: 8 },
    { label: 'D2', batches: 15, shipments: 10 },
    { label: 'D3', batches: 9, shipments: 7 },
    { label: 'D4', batches: 18, shipments: 12 },
    { label: 'D5', batches: 20, shipments: 14 },
    { label: 'D6', batches: 16, shipments: 11 },
    { label: 'D7', batches: 22, shipments: 15 },
    { label: 'D8', batches: 19, shipments: 13 },
    { label: 'D9', batches: 24, shipments: 16 },
    { label: 'D10', batches: 21, shipments: 15 },
  ];

  const fallbackBatches: BatchData[] = [
    {
      id: 'fallback-b-12345',
      batchNumber: 'B-12345',
      fittingType: 'Elastic Rail Clips',
      quantity: 50000,
      status: 'delivered',
      createdAt: new Date(),
      expectedDelivery: new Date(),
    },
    {
      id: 'fallback-b-67890',
      batchNumber: 'B-67890',
      fittingType: 'Grooved Rubber Soleplates',
      quantity: 30000,
      status: 'ready',
      createdAt: new Date(),
      expectedDelivery: new Date(),
    },
  ];

  const fallbackShipments: ShipmentData[] = [
    {
      id: 'fallback-s-11223',
      batchId: 'B-12345',
      destination: 'Mumbai CSMT',
      status: 'in_transit',
      trackingNumber: 'S-11223',
      createdAt: new Date(),
    },
    {
      id: 'fallback-s-44556',
      batchId: 'B-67890',
      destination: 'New Delhi NDLS',
      status: 'pending',
      trackingNumber: 'S-44556',
      createdAt: new Date(),
    },
  ];

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    unsubscribers.push(
      vendorDataService.subscribeStats(vendorId, (s) => setStats(s))
    );

    unsubscribers.push(
      vendorDataService.subscribeBatches(vendorId, (rows) => {
        const mapped: BatchData[] = rows.map((r: any) => ({
          ...r,
          createdAt: r.createdAt?.toDate ? r.createdAt.toDate() : (r.createdAt ? new Date(r.createdAt) : new Date()),
          expectedDelivery: r.expectedDelivery?.toDate ? r.expectedDelivery.toDate() : (r.expectedDelivery ? new Date(r.expectedDelivery) : new Date())
        }));
        setBatches(mapped);
      })
    );

    unsubscribers.push(
      vendorDataService.subscribeShipments(vendorId, (rows) => {
        const mapped: ShipmentData[] = rows.map((r: any) => ({
          ...r,
          createdAt: r.createdAt?.toDate ? r.createdAt.toDate() : (r.createdAt ? new Date(r.createdAt) : new Date())
        }));
        setShipments(mapped);
      })
    );

    unsubscribers.push(
      vendorDataService.subscribePerformance(vendorId, (rows) => setPerformanceData(rows))
    );

    unsubscribers.push(
      vendorDataService.subscribeFittingTypes(vendorId, (rows) => setFittingTypeData(rows))
    );

    return () => {
      unsubscribers.forEach((u) => u && u());
    };
  }, [vendorId]);

  // Filter by fitting type (pie interaction)
  const [selectedFitting, setSelectedFitting] = useState<string | null>(null);
  const handleSliceClick = (name: string) => setSelectedFitting((cur) => (cur === name ? null : name));

  // Infinite scroll for lists (client-side windowing)
  const [batchLimit, setBatchLimit] = useState(10);
  const [shipmentLimit, setShipmentLimit] = useState(10);
  const loadMoreBatches = useCallback(() => setBatchLimit((n) => n + 10), []);
  const loadMoreShipments = useCallback(() => setShipmentLimit((n) => n + 10), []);

  const filteredBatches = useMemo(() => {
    const all = batches.length > 0 ? batches : fallbackBatches;
    return selectedFitting ? all.filter(b => (b.fittingType || '').toLowerCase().includes(selectedFitting.toLowerCase())) : all;
  }, [batches, fallbackBatches, selectedFitting]);

  const visibleBatches = filteredBatches.slice(0, batchLimit);
  const allShipments = shipments.length > 0 ? shipments : fallbackShipments;
  const visibleShipments = allShipments.slice(0, shipmentLimit);

  const hasLiveKpis = stats.totalBatches || stats.pendingShipments || stats.completedShipments || stats.qrCodesGenerated || stats.blockchainRecords;
  const kpi = hasLiveKpis ? stats : {
    totalBatches: 123,
    pendingShipments: 45,
    completedShipments: 78,
    qrCodesGenerated: 901,
    blockchainRecords: 234,
  } as VendorStats;

  const chartData: PerformancePoint[] = performanceData.length > 0 ? performanceData : fallbackPerformanceData;

  // KPI micro-visualizations helpers
  const batchesSpark = useMemo(() => chartData.map(d => d.batches ?? 0), [chartData]);
  const shipmentsTrend = useMemo(() => chartData.map(d => d.shipments ?? 0), [chartData]);
  const totalShipments = stats.pendingShipments + stats.completedShipments;
  const pendingRatio = totalShipments > 0 ? (stats.pendingShipments / totalShipments) : 0;
  const completedBars = shipmentsTrend.slice(-6); // recent small bars

  const buildSparkPath = (values: number[], width = 80, height = 24) => {
    if (values.length === 0) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = Math.max(1, max - min);
    const stepX = width / Math.max(1, values.length - 1);
    return values.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / span) * height;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
  };

  const scrollToAnchor = (anchorId: string) => {
    const el = document.getElementById(anchorId);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <div className="vendor-scope min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 border-b backdrop-blur-sm" style={{ backgroundColor: 'color-mix(in oklab, var(--color-card) 90%, transparent)', borderColor: 'var(--color-border)' }}>
        <div className="container mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="font-bold tracking-tight" style={{ color: 'var(--color-text-primary)', fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>RailTrace</h1>
              <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }} aria-label="Role: Vendor">विक्रेता / Vendor</span>
            </div>
            <div className="flex items-center gap-2">
              <button aria-label="Refresh" className="flex h-11 w-11 items-center justify-center rounded-full touch-target transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                <RefreshCw className="h-5 w-5" />
              </button>
              <button aria-label="New Batch" className="flex h-11 w-11 items-center justify-center rounded-full touch-target text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
          <h2 className="mt-4 font-bold" style={{ color: 'var(--color-text-primary)', fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>Namaste, {userData?.name || 'Vendor'}</h2>
        </div>
      </div>

      <div className="container mx-auto p-4 space-y-6">
        {/* KPI with micro-visualizations */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 3xl:grid-cols-5">
          {/* Total Batches - sparkline */}
          <button onClick={() => scrollToAnchor('recent-batches')} className="flex flex-col gap-2 rounded-xl p-4 transition-transform active:scale-95" style={{ backgroundColor: 'var(--color-card)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Total Batches</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{kpi.totalBatches.toString()}</p>
            </div>
            <svg width="100%" height="24" viewBox="0 0 80 24" preserveAspectRatio="none">
              <path d={buildSparkPath(batchesSpark)} fill="none" stroke="var(--chart-primary)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
          </button>

          {/* Pending Shipments - donut progress */}
          <button onClick={() => scrollToAnchor('recent-shipments')} className="flex flex-col gap-2 rounded-xl p-4 transition-transform active:scale-95" style={{ backgroundColor: 'var(--color-card)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Pending Shipments</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{kpi.pendingShipments}</p>
            </div>
            <svg width="56" height="56" viewBox="0 0 36 36" className="mt-1">
              <circle cx="18" cy="18" r="16" fill="none" stroke="color-mix(in srgb, var(--color-text-secondary) 20%, transparent)" strokeWidth="4" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="var(--chart-warning)" strokeWidth="4" strokeDasharray={`${Math.max(2, Math.round(pendingRatio * 100))} ${100 - Math.max(2, Math.round(pendingRatio * 100))}`} strokeDashoffset="25" pathLength="100" />
            </svg>
          </button>

          {/* Completed - mini bars */}
          <button onClick={() => scrollToAnchor('recent-shipments')} className="flex flex-col gap-2 rounded-xl p-4 transition-transform active:scale-95" style={{ backgroundColor: 'var(--color-card)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Completed</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{kpi.completedShipments}</p>
            </div>
            <div className="flex items-end gap-1 h-6 mt-1">
              {completedBars.map((v, i) => {
                const max = Math.max(1, ...completedBars);
                const h = Math.max(2, Math.round((v / max) * 24));
                return <div key={i} style={{ width: 6, height: h, backgroundColor: 'var(--chart-success)' }} />;
              })}
            </div>
          </button>

          {/* QR Codes Generated - sparkline (reuse batches trend as proxy if QR trend not available) */}
          <button className="flex flex-col gap-2 rounded-xl p-4 transition-transform active:scale-95" style={{ backgroundColor: 'var(--color-card)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>QR Generated</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{kpi.qrCodesGenerated}</p>
            </div>
            <svg width="100%" height="24" viewBox="0 0 80 24" preserveAspectRatio="none">
              <path d={buildSparkPath(batchesSpark)} fill="none" stroke="var(--chart-success)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
          </button>

          {/* Blockchain Records - donut ring (assume all confirmed if no split provided) */}
          <button className="flex flex-col gap-2 rounded-xl p-4 transition-transform active:scale-95 md:col-span-1 col-span-2" style={{ backgroundColor: 'var(--color-card)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Blockchain Records</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{kpi.blockchainRecords}</p>
            </div>
            <svg width="56" height="56" viewBox="0 0 36 36" className="mt-1">
              <circle cx="18" cy="18" r="16" fill="none" stroke="color-mix(in srgb, var(--color-text-secondary) 20%, transparent)" strokeWidth="4" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="var(--chart-primary)" strokeWidth="4" strokeDasharray={`100 0`} strokeDashoffset="0" pathLength="100" />
            </svg>
          </button>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 id="performance-overview" className="font-semibold" style={{ color: 'var(--color-text-primary)', fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}>Performance Overview</h3>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="text-sm rounded-lg px-3 py-1"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                  <Button variant="outline" size="sm" onClick={() => setPerfOpen(true)} aria-label="Expand">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="batches" stroke="var(--chart-primary)" strokeWidth={2} name="Batches" />
                    <Line type="monotone" dataKey="shipments" stroke="var(--chart-success)" strokeWidth={2} name="Shipments" />
                    {chartData.some(d => typeof d.quality === 'number') && (
                      <Line type="monotone" dataKey="quality" stroke="var(--chart-warning)" strokeWidth={2} name="Quality %" />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Fitting Types Distribution */}
          <Card>
            <CardHeader>
              <h3 id="fitting-types" className="font-semibold" style={{ color: 'var(--color-text-primary)', fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}>Fitting Types Distribution</h3>
            </CardHeader>
            <CardContent>
              {fittingTypeData.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-sm" style={{ color: 'var(--color-text-secondary)' }} aria-live="polite">No fitting distribution data</div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={fittingTypeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" onClick={(data) => handleSliceClick((data as any).name)}>
                        {fittingTypeData.map((item, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] as any} opacity={selectedFitting && selectedFitting !== item.name ? 0.5 : 1} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Batches */}
          <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <h3 id="recent-batches" className="font-semibold" style={{ color: 'var(--color-text-primary)', fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}>Recent Batches</h3>
              <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="hover:opacity-90" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                  <Button variant="outline" size="sm" className="hover:opacity-90" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {visibleBatches.length === 0 ? (
              <div className="space-y-3">
                <div className="h-16 rounded-lg animate-pulse" style={{ backgroundColor: 'color-mix(in srgb, var(--color-text-secondary) 10%, transparent)' }} />
                <div className="h-16 rounded-lg animate-pulse" style={{ backgroundColor: 'color-mix(in srgb, var(--color-text-secondary) 10%, transparent)' }} />
              </div>
            ) : (
              <div className="space-y-4">
                {visibleBatches.map((batch) => (
                  <div
                    key={batch.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}>
                        <Package className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div>
                        <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {batch.batchNumber}
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {batch.fittingType} • {batch.quantity} units
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          Created: {batch.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="px-2 py-1 rounded-full text-xs font-medium" style={{
                        backgroundColor: (() => {
                          switch (batch.status) {
                            case 'manufacturing': return 'color-mix(in srgb, var(--chart-warning) 18%, transparent)';
                            case 'ready': return 'color-mix(in srgb, var(--color-primary) 18%, transparent)';
                            case 'shipped': return 'color-mix(in srgb, var(--color-accent) 18%, transparent)';
                            case 'delivered': return 'color-mix(in srgb, var(--chart-success) 18%, transparent)';
                            default: return 'color-mix(in srgb, var(--color-text-secondary) 12%, transparent)';
                          }
                        })(),
                        color: 'var(--color-text-primary)'
                      }}>
                        <div className="flex items-center gap-1">
                          {(() => {
                            switch (batch.status) {
                              case 'manufacturing': return <Clock className="h-4 w-4" />;
                              case 'ready': return <CheckCircle className="h-4 w-4" />;
                              case 'shipped': return <Truck className="h-4 w-4" />;
                              case 'delivered': return <CheckCircle className="h-4 w-4" />;
                              default: return <AlertTriangle className="h-4 w-4" />;
                            }
                          })()}
                          {batch.status.replace('_', ' ')}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="hover:opacity-90" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} aria-label="View batch details">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredBatches.length > visibleBatches.length && (
                  <div className="flex justify-center">
                    <Button variant="outline" size="sm" onClick={loadMoreBatches}>Load more</Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Shipments */}
          <Card>
          <CardHeader>
              <h3 id="recent-shipments" className="font-semibold" style={{ color: 'var(--color-text-primary)', fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}>Recent Shipments</h3>
          </CardHeader>
          <CardContent>
            {visibleShipments.length === 0 ? (
              <div className="space-y-3">
                <div className="h-16 rounded-lg animate-pulse" style={{ backgroundColor: 'color-mix(in srgb, var(--color-text-secondary) 10%, transparent)' }} />
                <div className="h-16 rounded-lg animate-pulse" style={{ backgroundColor: 'color-mix(in srgb, var(--color-text-secondary) 10%, transparent)' }} />
              </div>
            ) : (
              <div className="space-y-4">
                {visibleShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}>
                        <Truck className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div>
                        <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {shipment.trackingNumber}
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {shipment.destination} • Batch: {shipment.batchId}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          Created: {shipment.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="px-2 py-1 rounded-full text-xs font-medium" style={{
                        backgroundColor: (() => {
                          switch (shipment.status) {
                            case 'pending': return 'color-mix(in srgb, var(--chart-warning) 18%, transparent)';
                            case 'in_transit': return 'color-mix(in srgb, var(--color-primary) 18%, transparent)';
                            case 'delivered': return 'color-mix(in srgb, var(--chart-success) 18%, transparent)';
                            default: return 'color-mix(in srgb, var(--color-text-secondary) 12%, transparent)';
                          }
                        })(),
                        color: 'var(--color-text-primary)'
                      }}>
                        <div className="flex items-center gap-1">
                          {(() => {
                            switch (shipment.status) {
                              case 'pending': return <Clock className="h-4 w-4" />;
                              case 'in_transit': return <Truck className="h-4 w-4" />;
                              case 'delivered': return <CheckCircle className="h-4 w-4" />;
                              default: return <AlertTriangle className="h-4 w-4" />;
                            }
                          })()}
                          {shipment.status.replace('_', ' ')}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="hover:opacity-90" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} aria-label="View shipment details">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {allShipments.length > visibleShipments.length && (
                  <div className="flex justify-center">
                    <Button variant="outline" size="sm" onClick={loadMoreShipments}>Load more</Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full-screen performance modal */}
      <Modal isOpen={perfOpen} onClose={() => setPerfOpen(false)}>
        <div className="p-2" style={{ backgroundColor: 'var(--color-card)' }}>
          <div className="h-[70vh]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 16, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="batches" stroke="var(--chart-primary)" strokeWidth={2} name="Batches" />
                <Line type="monotone" dataKey="shipments" stroke="var(--chart-success)" strokeWidth={2} name="Shipments" />
                {chartData.some(d => typeof d.quality === 'number') && (
                  <Line type="monotone" dataKey="quality" stroke="var(--chart-warning)" strokeWidth={2} name="Quality %" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Modal>

      <VendorFooterNav active="home" />
    </div>
  );
}