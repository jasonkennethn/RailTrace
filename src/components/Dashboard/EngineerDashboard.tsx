import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { StatsCard } from './StatsCard';
import { 
  QrCode, 
  Wrench, 
  MapPin, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Package,
  ClipboardCheck,
  Camera,
  TrendingUp,
  Eye,
  Plus,
  Filter,
  Search,
  Download,
  RefreshCw,
  ScanLine,
  ArrowRight,
  Calendar,
  Users
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

interface EngineerStats {
  installationsToday: number;
  pendingWorkOrders: number;
  completedToday: number;
  qrScansToday: number;
  locationsVisited: number;
}

interface WorkOrder {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed';
  location: string;
  fittingType: string;
  assignedDate: Date;
  dueDate: Date;
  qrCode?: string;
}

interface Installation {
  id: string;
  fittingType: string;
  location: string;
  trackSection: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  engineerId: string;
  qrCode: string;
}

export function EngineerDashboard() {
  const { userData } = useAuth();
  const [stats, setStats] = useState<EngineerStats>({
    installationsToday: 0,
    pendingWorkOrders: 0,
    completedToday: 0,
    qrScansToday: 0,
    locationsVisited: 0
  });
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  // Mock data for demonstration
  const mockStats: EngineerStats = {
    installationsToday: 8,
    pendingWorkOrders: 12,
    completedToday: 6,
    qrScansToday: 25,
    locationsVisited: 4
  };

  const mockWorkOrders: WorkOrder[] = [
    {
      id: '1',
      title: 'Install Wheel Set - Track Section A',
      priority: 'high',
      status: 'in_progress',
      location: 'Mumbai Central',
      fittingType: 'Wheel Set',
      assignedDate: new Date('2024-01-20'),
      dueDate: new Date('2024-01-22'),
      qrCode: 'QR-001'
    },
    {
      id: '2',
      title: 'Replace Brake Pad - Track Section B',
      priority: 'medium',
      status: 'pending',
      location: 'Delhi Junction',
      fittingType: 'Brake Pad',
      assignedDate: new Date('2024-01-21'),
      dueDate: new Date('2024-01-23'),
      qrCode: 'QR-002'
    },
    {
      id: '3',
      title: 'Maintenance Check - Coupling System',
      priority: 'low',
      status: 'completed',
      location: 'Chennai Central',
      fittingType: 'Coupling',
      assignedDate: new Date('2024-01-19'),
      dueDate: new Date('2024-01-20'),
      qrCode: 'QR-003'
    }
  ];

  const mockInstallations: Installation[] = [
    {
      id: '1',
      fittingType: 'Wheel Set',
      location: 'Mumbai Central',
      trackSection: 'A-12',
      status: 'in_progress',
      startTime: new Date('2024-01-21T09:00:00'),
      engineerId: 'ENG-001',
      qrCode: 'QR-001'
    },
    {
      id: '2',
      fittingType: 'Brake Pad',
      location: 'Delhi Junction',
      trackSection: 'B-05',
      status: 'completed',
      startTime: new Date('2024-01-21T08:00:00'),
      endTime: new Date('2024-01-21T10:30:00'),
      engineerId: 'ENG-001',
      qrCode: 'QR-002'
    }
  ];

  const performanceData = [
    { day: 'Mon', installations: 3, completed: 2, scans: 8 },
    { day: 'Tue', installations: 5, completed: 4, scans: 12 },
    { day: 'Wed', installations: 4, completed: 3, scans: 10 },
    { day: 'Thu', installations: 6, completed: 5, scans: 15 },
    { day: 'Fri', installations: 7, completed: 6, scans: 18 },
    { day: 'Sat', installations: 2, completed: 2, scans: 6 },
    { day: 'Sun', installations: 1, completed: 1, scans: 3 }
  ];

  const workOrderData = [
    { priority: 'Critical', count: 2, color: '#EF4444' },
    { priority: 'High', count: 5, color: '#F59E0B' },
    { priority: 'Medium', count: 8, color: '#1773cf' },
    { priority: 'Low', count: 3, color: '#10B981' }
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats(mockStats);
        setWorkOrders(mockWorkOrders);
        setInstallations(mockInstallations);
      } catch (error) {
        console.error('Error loading engineer data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-danger-light/10 text-danger-light dark:bg-danger-dark/20 dark:text-danger-dark';
      case 'high':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'failed':
        return 'bg-danger-light/10 text-danger-light dark:bg-danger-dark/20 dark:text-danger-dark';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Clock className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <Wrench className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#0d1117]">
      {/* Header */}
      <div className="bg-[#ffffff] dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d]">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0d1117] dark:text-[#c9d1d9] font-display">
                Engineer Dashboard
              </h1>
              <p className="text-[#57606a] dark:text-[#8b949e]">
                Welcome back, {userData?.name || 'Engineer'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-[#d0d7de] dark:border-[#30363d] text-[#0d1117] dark:text-[#c9d1d9] hover:bg-[#f0f2f5] dark:hover:bg-[#0d1117]">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" className="bg-[#1773cf] hover:bg-[#1773cf]/90 text-white">
                <ScanLine className="h-4 w-4 mr-2" />
                QR Scanner
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard
            title="Installations Today"
            value={stats.installationsToday.toString()}
            icon={<Wrench className="h-5 w-5" />}
            trend="+2"
            trendUp={true}
          />
          <StatsCard
            title="Pending Work Orders"
            value={stats.pendingWorkOrders.toString()}
            icon={<ClipboardCheck className="h-5 w-5" />}
            trend="+3"
            trendUp={false}
          />
          <StatsCard
            title="Completed Today"
            value={stats.completedToday.toString()}
            icon={<CheckCircle className="h-5 w-5" />}
            trend="+1"
            trendUp={true}
          />
          <StatsCard
            title="QR Scans Today"
            value={stats.qrScansToday.toString()}
            icon={<QrCode className="h-5 w-5" />}
            trend="+5"
            trendUp={true}
          />
          <StatsCard
            title="Locations Visited"
            value={stats.locationsVisited.toString()}
            icon={<MapPin className="h-5 w-5" />}
            trend="+1"
            trendUp={true}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <Card>
            <CardHeader title="Daily Performance" subtitle="Installations and completions">
              <div className="flex items-center gap-2">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="text-sm border border-border-light dark:border-border-dark rounded-lg px-3 py-1 bg-surface-light dark:bg-surface-dark text-content-light dark:text-content-dark"
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
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="installations" 
                      stroke="#1773cf" 
                      strokeWidth={2}
                      name="Installations"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Completed"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="scans" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      name="QR Scans"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Work Order Priority */}
          <Card>
            <CardHeader title="Work Order Priority" subtitle="Current workload distribution">
              <Button variant="outline" size="sm" className="border-[#d0d7de] dark:border-[#30363d] text-[#0d1117] dark:text-[#c9d1d9] hover:bg-[#f0f2f5] dark:hover:bg-[#0d1117]">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workOrderData.map((item, index) => (
                  <div key={item.priority} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium text-[#0d1117] dark:text-[#c9d1d9]">
                        {item.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-[#57606a] dark:text-[#8b949e]">
                        {item.count} orders
                      </span>
                      <Badge variant="default" size="sm">
                        {Math.round((item.count / workOrderData.reduce((sum, d) => sum + d.count, 0)) * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Work Orders */}
        <Card>
          <CardHeader title="Work Orders" subtitle="Your assigned tasks">
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
                New Order
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <ClipboardCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground-light dark:text-foreground-dark">
                        {order.title}
                      </h4>
                      <p className="text-sm text-subtle-light dark:text-subtle-dark">
                        {order.location} • {order.fittingType}
                      </p>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark">
                        Due: {order.dueDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getPriorityColor(order.priority)}>
                      <div className="flex items-center gap-1">
                        {getPriorityIcon(order.priority)}
                        {order.priority}
                      </div>
                    </Badge>
                    <Badge className={getStatusColor(order.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status.replace('_', ' ')}
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

        {/* Recent Installations */}
        <Card>
          <CardHeader title="Recent Installations" subtitle="Latest installation activities">
            <Button variant="outline" size="sm" className="border-[#d0d7de] dark:border-[#30363d] text-[#0d1117] dark:text-[#c9d1d9] hover:bg-[#f0f2f5] dark:hover:bg-[#0d1117]">
              <ArrowRight className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {installations.map((installation) => (
                <div
                  key={installation.id}
                  className="flex items-center justify-between p-4 bg-[#f0f2f5] dark:bg-[#0d1117] rounded-lg border border-[#d0d7de] dark:border-[#30363d]"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#1773cf]/10 rounded-lg flex items-center justify-center">
                      <Wrench className="h-6 w-6 text-[#1773cf]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0d1117] dark:text-[#c9d1d9]">
                        {installation.fittingType}
                      </h4>
                      <p className="text-sm text-[#57606a] dark:text-[#8b949e]">
                        {installation.location} • Track: {installation.trackSection}
                      </p>
                      <p className="text-xs text-[#57606a] dark:text-[#8b949e]">
                        Started: {installation.startTime.toLocaleString()}
                        {installation.endTime && ` • Completed: ${installation.endTime.toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(installation.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(installation.status)}
                        {installation.status.replace('_', ' ')}
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