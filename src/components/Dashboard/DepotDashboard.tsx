import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { StatsCard } from './StatsCard';
import { 
  QrCode, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Truck,
  Warehouse,
  TrendingUp,
  Eye,
  MapPin,
  Plus,
  Filter,
  Search,
  Download,
  RefreshCw,
  ScanLine,
  ArrowRight
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';

interface DepotStats {
  totalInventory: number;
  pendingReceipts: number;
  dispatchedToday: number;
  qrScansToday: number;
  criticalAlerts: number;
}

interface InventoryItem {
  id: string;
  fittingType: string;
  batchNumber: string;
  vendorId: string;
  quantity: number;
  status: 'received' | 'stored' | 'dispatched' | 'low_stock';
  receivedDate: Date;
  location: string;
  qrCode: string;
}

interface TransferData {
  id: string;
  fromLocation: string;
  toLocation: string;
  fittingType: string;
  quantity: number;
  status: 'pending' | 'in_transit' | 'completed';
  initiatedBy: string;
  initiatedAt: Date;
}

export function DepotDashboard() {
  const { userData } = useAuth();
  const [stats, setStats] = useState<DepotStats>({
    totalInventory: 0,
    pendingReceipts: 0,
    dispatchedToday: 0,
    qrScansToday: 0,
    criticalAlerts: 0
  });
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transfers, setTransfers] = useState<TransferData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  // Mock data for demonstration
  const mockStats: DepotStats = {
    totalInventory: 1250,
    pendingReceipts: 8,
    dispatchedToday: 45,
    qrScansToday: 120,
    criticalAlerts: 3
  };

  const mockInventory: InventoryItem[] = [
    {
      id: '1',
      fittingType: 'Wheel Set',
      batchNumber: 'BATCH-2024-001',
      vendorId: 'VENDOR-001',
      quantity: 50,
      status: 'stored',
      receivedDate: new Date('2024-01-15'),
      location: 'A-12-B',
      qrCode: 'QR-001'
    },
    {
      id: '2',
      fittingType: 'Brake Pad',
      batchNumber: 'BATCH-2024-002',
      vendorId: 'VENDOR-002',
      quantity: 25,
      status: 'low_stock',
      receivedDate: new Date('2024-01-10'),
      location: 'B-05-C',
      qrCode: 'QR-002'
    },
    {
      id: '3',
      fittingType: 'Coupling',
      batchNumber: 'BATCH-2024-003',
      vendorId: 'VENDOR-003',
      quantity: 15,
      status: 'dispatched',
      receivedDate: new Date('2024-01-05'),
      location: 'C-08-A',
      qrCode: 'QR-003'
    }
  ];

  const mockTransfers: TransferData[] = [
    {
      id: '1',
      fromLocation: 'Mumbai Depot',
      toLocation: 'Delhi Depot',
      fittingType: 'Wheel Set',
      quantity: 20,
      status: 'in_transit',
      initiatedBy: 'John Doe',
      initiatedAt: new Date('2024-01-20')
    },
    {
      id: '2',
      fromLocation: 'Chennai Depot',
      toLocation: 'Bangalore Depot',
      fittingType: 'Brake Pad',
      quantity: 30,
      status: 'completed',
      initiatedBy: 'Jane Smith',
      initiatedAt: new Date('2024-01-18')
    }
  ];

  const inventoryTrendData = [
    { day: 'Mon', received: 15, dispatched: 12, scanned: 25 },
    { day: 'Tue', received: 22, dispatched: 18, scanned: 35 },
    { day: 'Wed', received: 18, dispatched: 15, scanned: 28 },
    { day: 'Thu', received: 25, dispatched: 20, scanned: 40 },
    { day: 'Fri', received: 20, dispatched: 16, scanned: 32 },
    { day: 'Sat', received: 12, dispatched: 10, scanned: 20 },
    { day: 'Sun', received: 8, dispatched: 6, scanned: 15 }
  ];

  const fittingTypeData = [
    { name: 'Wheel Set', value: 450, percentage: 36 },
    { name: 'Brake Pad', value: 320, percentage: 26 },
    { name: 'Coupling', value: 280, percentage: 22 },
    { name: 'Bearing', value: 200, percentage: 16 }
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats(mockStats);
        setInventory(mockInventory);
        setTransfers(mockTransfers);
      } catch (error) {
        console.error('Error loading depot data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'stored':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'dispatched':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <CheckCircle className="h-4 w-4" />;
      case 'stored':
        return <Warehouse className="h-4 w-4" />;
      case 'dispatched':
        return <Truck className="h-4 w-4" />;
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in_transit':
        return <Truck className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#0d1117]">
      {/* Header */}
      <div className="bg-[#ffffff] dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d]">
        <div className="px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0d1117] dark:text-[#c9d1d9] font-display">
                Depot Dashboard
              </h1>
              <p className="text-sm sm:text-base text-[#57606a] dark:text-[#8b949e]">
                Welcome back, {userData?.name || 'Depot Manager'}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="outline" size="sm" className="border-[#d0d7de] dark:border-[#30363d] text-[#0d1117] dark:text-[#c9d1d9] hover:bg-[#f0f2f5] dark:hover:bg-[#0d1117] touch-target">
                <RefreshCw className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button size="sm" className="bg-[#1773cf] hover:bg-[#1773cf]/90 text-white touch-target">
                <ScanLine className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">QR Scanner</span>
                <span className="sm:hidden">Scan</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          <StatsCard
            title="Total Inventory"
            value={stats.totalInventory.toLocaleString()}
            icon={<Package className="h-5 w-5" />}
            trend="+5%"
            trendUp={true}
          />
          <StatsCard
            title="Pending Receipts"
            value={stats.pendingReceipts.toString()}
            icon={<Clock className="h-5 w-5" />}
            trend="+2"
            trendUp={false}
          />
          <StatsCard
            title="Dispatched Today"
            value={stats.dispatchedToday.toString()}
            icon={<Truck className="h-5 w-5" />}
            trend="+12%"
            trendUp={true}
          />
          <StatsCard
            title="QR Scans Today"
            value={stats.qrScansToday.toString()}
            icon={<QrCode className="h-5 w-5" />}
            trend="+8%"
            trendUp={true}
          />
          <StatsCard
            title="Critical Alerts"
            value={stats.criticalAlerts.toString()}
            icon={<AlertTriangle className="h-5 w-5" />}
            trend="-1"
            trendUp={true}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Inventory Trend Chart */}
          <Card>
            <CardHeader title="Inventory Activity Trend" subtitle="Last 7 days">
              <div className="flex items-center gap-2">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="text-sm border border-[#d0d7de] dark:border-[#30363d] rounded-lg px-3 py-1 bg-[#f0f2f5] dark:bg-[#0d1117] text-[#0d1117] dark:text-[#c9d1d9]"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={inventoryTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="received" 
                      stroke="#1773cf" 
                      strokeWidth={2}
                      name="Received"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="dispatched" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Dispatched"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="scanned" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      name="Scanned"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Fitting Types Distribution */}
          <Card>
            <CardHeader title="Inventory by Type" subtitle="Current stock distribution">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fittingTypeData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-subtle-light dark:text-subtle-dark">
                        {item.value} units
                      </span>
                      <Badge variant="default" size="sm">
                        {item.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Inventory */}
        <Card>
          <CardHeader title="Current Inventory" subtitle="Latest inventory items">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-[#f0f2f5] dark:bg-[#0d1117] rounded-lg border border-[#d0d7de] dark:border-[#30363d]"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#1773cf]/10 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-[#1773cf]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0d1117] dark:text-[#c9d1d9]">
                        {item.fittingType}
                      </h4>
                      <p className="text-sm text-[#57606a] dark:text-[#8b949e]">
                        Batch: {item.batchNumber} • Location: {item.location}
                      </p>
                      <p className="text-xs text-[#57606a] dark:text-[#8b949e]">
                        Received: {item.receivedDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[#0d1117] dark:text-[#c9d1d9]">
                        {item.quantity}
                      </p>
                      <p className="text-xs text-[#57606a] dark:text-[#8b949e]">units</p>
                    </div>
                    <Badge className={getStatusColor(item.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(item.status)}
                        {item.status.replace('_', ' ')}
                      </div>
                    </Badge>
                    <Button variant="outline" size="sm" className="border-[#d0d7de] dark:border-[#30363d] text-[#0d1117] dark:text-[#c9d1d9] hover:bg-[#f0f2f5] dark:hover:bg-[#0d1117]">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transfers */}
        <Card>
          <CardHeader title="Recent Transfers" subtitle="Latest transfer activities">
            <Button variant="outline" size="sm">
              <ArrowRight className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Truck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground-light dark:text-foreground-dark">
                        {transfer.fittingType}
                      </h4>
                      <p className="text-sm text-subtle-light dark:text-subtle-dark">
                        {transfer.fromLocation} → {transfer.toLocation}
                      </p>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark">
                        Initiated by {transfer.initiatedBy} • {transfer.initiatedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
                        {transfer.quantity}
                      </p>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark">units</p>
                    </div>
                    <Badge className={getStatusColor(transfer.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(transfer.status)}
                        {transfer.status.replace('_', ' ')}
                      </div>
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}