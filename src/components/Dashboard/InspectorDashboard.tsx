import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { StatsCard } from './StatsCard';
import { 
  QrCode, 
  ClipboardCheck, 
  Image, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Package,
  Camera,
  TrendingUp,
  Eye,
  MapPin,
  Plus,
  Filter,
  Search,
  Download,
  RefreshCw,
  ScanLine,
  ArrowRight,
  Calendar,
  Shield,
  XCircle
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

interface InspectorStats {
  inspectionsToday: number;
  pendingInspections: number;
  passedToday: number;
  failedToday: number;
  photosUploaded: number;
}

interface InspectionTask {
  id: string;
  fittingId: string;
  fittingType: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed';
  assignedDate: Date;
  dueDate: Date;
  qrCode: string;
  previousInspection?: Date;
}

interface InspectionResult {
  id: string;
  fittingId: string;
  fittingType: string;
  location: string;
  result: 'pass' | 'fail' | 'conditional';
  inspectorId: string;
  inspectionDate: Date;
  photos: string[];
  notes: string;
  defects?: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export function InspectorDashboard() {
  const { userData } = useAuth();
  const [stats, setStats] = useState<InspectorStats>({
    inspectionsToday: 0,
    pendingInspections: 0,
    passedToday: 0,
    failedToday: 0,
    photosUploaded: 0
  });
  const [inspectionTasks, setInspectionTasks] = useState<InspectionTask[]>([]);
  const [inspectionResults, setInspectionResults] = useState<InspectionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  // Mock data for demonstration
  const mockStats: InspectorStats = {
    inspectionsToday: 15,
    pendingInspections: 8,
    passedToday: 12,
    failedToday: 3,
    photosUploaded: 45
  };

  const mockInspectionTasks: InspectionTask[] = [
    {
      id: '1',
      fittingId: 'FITTING-001',
      fittingType: 'Wheel Set',
      location: 'Mumbai Central',
      priority: 'high',
      status: 'in_progress',
      assignedDate: new Date('2024-01-20'),
      dueDate: new Date('2024-01-22'),
      qrCode: 'QR-001',
      previousInspection: new Date('2024-01-15')
    },
    {
      id: '2',
      fittingId: 'FITTING-002',
      fittingType: 'Brake Pad',
      location: 'Delhi Junction',
      priority: 'medium',
      status: 'pending',
      assignedDate: new Date('2024-01-21'),
      dueDate: new Date('2024-01-23'),
      qrCode: 'QR-002',
      previousInspection: new Date('2024-01-10')
    },
    {
      id: '3',
      fittingId: 'FITTING-003',
      fittingType: 'Coupling',
      location: 'Chennai Central',
      priority: 'low',
      status: 'completed',
      assignedDate: new Date('2024-01-19'),
      dueDate: new Date('2024-01-20'),
      qrCode: 'QR-003',
      previousInspection: new Date('2024-01-05')
    }
  ];

  const mockInspectionResults: InspectionResult[] = [
    {
      id: '1',
      fittingId: 'FITTING-001',
      fittingType: 'Wheel Set',
      location: 'Mumbai Central',
      result: 'pass',
      inspectorId: 'INS-001',
      inspectionDate: new Date('2024-01-21T10:00:00'),
      photos: ['photo1.jpg', 'photo2.jpg'],
      notes: 'All components in good condition'
    },
    {
      id: '2',
      fittingId: 'FITTING-002',
      fittingType: 'Brake Pad',
      location: 'Delhi Junction',
      result: 'fail',
      inspectorId: 'INS-001',
      inspectionDate: new Date('2024-01-21T11:30:00'),
      photos: ['photo3.jpg', 'photo4.jpg'],
      notes: 'Excessive wear detected',
      defects: ['Wear', 'Corrosion'],
      severity: 'high'
    }
  ];

  const inspectionTrendData = [
    { day: 'Mon', inspections: 8, passed: 6, failed: 2 },
    { day: 'Tue', inspections: 12, passed: 10, failed: 2 },
    { day: 'Wed', inspections: 10, passed: 8, failed: 2 },
    { day: 'Thu', inspections: 15, passed: 12, failed: 3 },
    { day: 'Fri', inspections: 18, passed: 15, failed: 3 },
    { day: 'Sat', inspections: 6, passed: 5, failed: 1 },
    { day: 'Sun', inspections: 4, passed: 3, failed: 1 }
  ];

  const defectTypeData = [
    { type: 'Wear', count: 8, percentage: 35 },
    { type: 'Corrosion', count: 6, percentage: 26 },
    { type: 'Crack', count: 4, percentage: 17 },
    { type: 'Misalignment', count: 3, percentage: 13 },
    { type: 'Other', count: 2, percentage: 9 }
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats(mockStats);
        setInspectionTasks(mockInspectionTasks);
        setInspectionResults(mockInspectionResults);
      } catch (error) {
        console.error('Error loading inspector data:', error);
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
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'pass':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'fail':
        return 'bg-danger-light/10 text-danger-light dark:bg-danger-dark/20 dark:text-danger-dark';
      case 'conditional':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
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
        return <ClipboardCheck className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'pass':
        return <CheckCircle className="h-4 w-4" />;
      case 'fail':
        return <XCircle className="h-4 w-4" />;
      case 'conditional':
        return <AlertTriangle className="h-4 w-4" />;
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
                Inspector Dashboard
              </h1>
              <p className="text-[#57606a] dark:text-[#8b949e]">
                Welcome back, {userData?.name || 'Inspector'}
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
            title="Inspections Today"
            value={stats.inspectionsToday.toString()}
            icon={<ClipboardCheck className="h-5 w-5" />}
            trend="+3"
            trendUp={true}
          />
          <StatsCard
            title="Pending Inspections"
            value={stats.pendingInspections.toString()}
            icon={<Clock className="h-5 w-5" />}
            trend="+2"
            trendUp={false}
          />
          <StatsCard
            title="Passed Today"
            value={stats.passedToday.toString()}
            icon={<CheckCircle className="h-5 w-5" />}
            trend="+1"
            trendUp={true}
          />
          <StatsCard
            title="Failed Today"
            value={stats.failedToday.toString()}
            icon={<XCircle className="h-5 w-5" />}
            trend="-1"
            trendUp={true}
          />
          <StatsCard
            title="Photos Uploaded"
            value={stats.photosUploaded.toString()}
            icon={<Camera className="h-5 w-5" />}
            trend="+8"
            trendUp={true}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inspection Trend Chart */}
          <Card>
            <CardHeader title="Inspection Trends" subtitle="Daily inspection results">
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
                  <LineChart data={inspectionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="inspections" 
                      stroke="#1773cf" 
                      strokeWidth={2}
                      name="Total Inspections"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="passed" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Passed"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="failed" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      name="Failed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Defect Types */}
          <Card>
            <CardHeader title="Defect Types" subtitle="Common inspection findings">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {defectTypeData.map((item, index) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
                        {item.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-subtle-light dark:text-subtle-dark">
                        {item.count} cases
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

        {/* Inspection Tasks */}
        <Card>
          <CardHeader title="Inspection Tasks" subtitle="Your assigned inspections">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-[#d0d7de] dark:border-[#30363d] text-[#0d1117] dark:text-[#c9d1d9] hover:bg-[#f0f2f5] dark:hover:bg-[#0d1117]">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="border-[#d0d7de] dark:border-[#30363d] text-[#0d1117] dark:text-[#c9d1d9] hover:bg-[#f0f2f5] dark:hover:bg-[#0d1117]">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button size="sm" className="bg-[#1773cf] hover:bg-[#1773cf]/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Inspection
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inspectionTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 bg-[#f0f2f5] dark:bg-[#0d1117] rounded-lg border border-[#d0d7de] dark:border-[#30363d]"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#1773cf]/10 rounded-lg flex items-center justify-center">
                      <ClipboardCheck className="h-6 w-6 text-[#1773cf]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0d1117] dark:text-[#c9d1d9]">
                        {task.fittingType} - {task.fittingId}
                      </h4>
                      <p className="text-sm text-[#57606a] dark:text-[#8b949e]">
                        {task.location} • QR: {task.qrCode}
                      </p>
                      <p className="text-xs text-[#57606a] dark:text-[#8b949e]">
                        Due: {task.dueDate.toLocaleDateString()}
                        {task.previousInspection && ` • Last: ${task.previousInspection.toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getPriorityColor(task.priority)}>
                      <div className="flex items-center gap-1">
                        {getPriorityIcon(task.priority)}
                        {task.priority}
                      </div>
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(task.status)}
                        {task.status.replace('_', ' ')}
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

        {/* Recent Inspection Results */}
        <Card>
          <CardHeader title="Recent Inspection Results" subtitle="Latest inspection outcomes">
            <Button variant="outline" size="sm">
              <ArrowRight className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inspectionResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground-light dark:text-foreground-dark">
                        {result.fittingType} - {result.fittingId}
                      </h4>
                      <p className="text-sm text-subtle-light dark:text-subtle-dark">
                        {result.location} • Inspector: {result.inspectorId}
                      </p>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark">
                        {result.inspectionDate.toLocaleString()}
                        {result.photos.length > 0 && ` • ${result.photos.length} photos`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getResultColor(result.result)}>
                      <div className="flex items-center gap-1">
                        {getResultIcon(result.result)}
                        {result.result}
                      </div>
                    </Badge>
                    {result.severity && (
                      <Badge variant="warning" size="sm">
                        {result.severity}
                      </Badge>
                    )}
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