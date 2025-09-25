import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Eye, CheckCircle, XCircle, Clock, MapPin, User, Calendar } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';

interface InspectionLog {
  id: string;
  taskId: string;
  productId: string;
  productName: string;
  inspectorName: string;
  inspectorRole: string;
  section: string;
  inspectionDate: Date;
  status: 'passed' | 'failed' | 'pending' | 'requires_attention';
  findings: string;
  recommendations: string;
  images: string[];
  blockchainHash: string;
  priority: 'low' | 'medium' | 'high';
  followUpRequired: boolean;
  nextInspectionDue?: Date;
}

const InspectionLogs: React.FC = () => {
  const { theme } = useTheme();
  const [logs, setLogs] = useState<InspectionLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<InspectionLog | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInspectionLogs();
  }, []);

  const loadInspectionLogs = async () => {
    setLoading(true);
    try {
      // Mock inspection logs data
      const mockLogs: InspectionLog[] = [
        {
          id: 'LOG-001',
          taskId: 'TASK-001',
          productId: 'RAIL-JOINT-RJ456',
          productName: 'Heavy Duty Rail Joint',
          inspectorName: 'Inspector Kumar',
          inspectorRole: 'SSE/PWI',
          section: 'Section A-123',
          inspectionDate: new Date('2024-01-22T10:30:00'),
          status: 'passed',
          findings: 'Rail joint in excellent condition. No visible wear, cracks, or deformation. All bolts properly tightened to specification. Joint alignment is within acceptable tolerances.',
          recommendations: 'Continue regular monitoring. Next inspection scheduled in 6 months. Apply protective coating during next maintenance window.',
          images: ['joint_overview.jpg', 'bolt_detail.jpg', 'alignment_check.jpg'],
          blockchainHash: '0x123abc456def789ghi012jkl345mno678pqr901stu234vwx567yza890bcd',
          priority: 'low',
          followUpRequired: false,
          nextInspectionDue: new Date('2024-07-22')
        },
        {
          id: 'LOG-002',
          taskId: 'TASK-002',
          productId: 'SIGNAL-BOX-SB789',
          productName: 'Digital Signal Control Box',
          inspectorName: 'Inspector Sharma',
          inspectorRole: 'SSE/PWI',
          section: 'Section B-456',
          inspectionDate: new Date('2024-01-21T14:15:00'),
          status: 'requires_attention',
          findings: 'Signal box housing shows minor corrosion on external panels. Internal components functioning normally. LED indicators operational. Communication systems tested and working.',
          recommendations: 'Schedule maintenance to address corrosion. Replace external housing panels. Apply anti-corrosion treatment. Test again after maintenance.',
          images: ['signal_box_exterior.jpg', 'corrosion_detail.jpg'],
          blockchainHash: '0x456def789abc123ghi456jkl789mno012pqr345stu678vwx901yza234bcd',
          priority: 'medium',
          followUpRequired: true,
          nextInspectionDue: new Date('2024-02-15')
        },
        {
          id: 'LOG-003',
          taskId: 'TASK-003',
          productId: 'TRACK-BOLT-TB321',
          productName: 'High Tensile Track Bolt',
          inspectorName: 'Inspector Patel',
          inspectorRole: 'AEN',
          section: 'Section C-789',
          inspectionDate: new Date('2024-01-20T09:45:00'),
          status: 'failed',
          findings: 'Multiple track bolts showing signs of fatigue and stress fractures. Torque values below specification. Some bolts have visible cracks and require immediate replacement.',
          recommendations: 'URGENT: Replace all affected bolts immediately. Conduct stress analysis of surrounding area. Implement enhanced monitoring protocol. Review installation procedures.',
          images: ['bolt_fracture.jpg', 'stress_analysis.jpg', 'torque_readings.jpg'],
          blockchainHash: '0x789abc123def456ghi789jkl012mno345pqr678stu901vwx234yza567bcd',
          priority: 'high',
          followUpRequired: true,
          nextInspectionDue: new Date('2024-01-25')
        },
        {
          id: 'LOG-004',
          taskId: 'TASK-004',
          productId: 'SLEEPER-SL654',
          productName: 'Prestressed Concrete Sleeper',
          inspectorName: 'Inspector Singh',
          inspectorRole: 'SSE/PWI',
          section: 'Section D-012',
          inspectionDate: new Date('2024-01-19T16:20:00'),
          status: 'passed',
          findings: 'Concrete sleepers in good condition. No visible cracks, spalling, or structural damage. Prestressing cables intact. Proper rail seat condition maintained.',
          recommendations: 'Continue current maintenance schedule. Monitor for any signs of deterioration. Check drainage around sleeper area during monsoon season.',
          images: ['sleeper_overview.jpg', 'rail_seat_detail.jpg'],
          blockchainHash: '0x012jkl345mno678pqr901stu234vwx567yza890bcd123abc456def789ghi',
          priority: 'low',
          followUpRequired: false,
          nextInspectionDue: new Date('2024-04-19')
        },
        {
          id: 'LOG-005',
          taskId: 'TASK-005',
          productId: 'SWITCH-SW987',
          productName: 'Automatic Track Switch',
          inspectorName: 'Inspector Gupta',
          inspectorRole: 'AEN',
          section: 'Section E-345',
          inspectionDate: new Date('2024-01-18T11:30:00'),
          status: 'pending',
          findings: 'Inspection in progress. Initial assessment shows normal operation. Detailed analysis of switching mechanism underway.',
          recommendations: 'Awaiting completion of mechanical and electrical tests. Full report to be submitted within 24 hours.',
          images: [],
          blockchainHash: '0x345mno678pqr901stu234vwx567yza890bcd123abc456def789ghi012jkl',
          priority: 'medium',
          followUpRequired: false
        }
      ];

      setLogs(mockLogs);
    } catch (error) {
      console.error('Error loading inspection logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.inspectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.section.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'requires_attention':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'requires_attention':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Inspection Logs
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review detailed inspection logs submitted by AENs and Field Inspectors
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="relative">
              <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="requires_attention">Requires Attention</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          <button
            onClick={loadInspectionLogs}
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Loading...' : 'Refresh Logs'}
          </button>
        </div>
      </div>

      {/* Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in cursor-pointer"
            onClick={() => setSelectedLog(log)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{log.id}</h3>
              <div className="flex items-center space-x-2">
                <span className={clsx(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getPriorityColor(log.priority)
                )}>
                  {log.priority}
                </span>
                <span className={clsx(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getStatusColor(log.status)
                )}>
                  {getStatusIcon(log.status)}
                  <span className="ml-1">{log.status.replace('_', ' ')}</span>
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Product</p>
                <p className="font-medium text-gray-900 dark:text-white">{log.productName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{log.productId}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Inspector</p>
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3 text-gray-400" />
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{log.inspectorName}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{log.inspectorRole}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Section</p>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{log.section}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Inspection Date</p>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {log.inspectionDate.toLocaleDateString()} at {log.inspectionDate.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Findings</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{log.findings}</p>
              </div>

              {log.followUpRequired && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">Follow-up Required</p>
                  {log.nextInspectionDue && (
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Next inspection: {log.nextInspectionDue.toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {log.images.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{log.images.length} images</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400">Blockchain verified</span>
                  </div>
                </div>
                <Eye className="h-4 w-4 text-primary-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Inspection Log - {selectedLog.id}
                </h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product</label>
                  <p className="text-gray-900 dark:text-white">{selectedLog.productName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{selectedLog.productId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <span className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getStatusColor(selectedLog.status)
                  )}>
                    {getStatusIcon(selectedLog.status)}
                    <span className="ml-1">{selectedLog.status.replace('_', ' ').toUpperCase()}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inspector</label>
                  <p className="text-gray-900 dark:text-white">{selectedLog.inspectorName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{selectedLog.inspectorRole}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                  <p className="text-gray-900 dark:text-white">{selectedLog.section}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inspection Date</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedLog.inspectionDate.toLocaleDateString()} at {selectedLog.inspectionDate.toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <span className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getPriorityColor(selectedLog.priority)
                  )}>
                    {selectedLog.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Findings</label>
                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-white">{selectedLog.findings}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations</label>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-white">{selectedLog.recommendations}</p>
                </div>
              </div>

              {selectedLog.images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Inspection Images ({selectedLog.images.length})
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedLog.images.map((image, index) => (
                      <div key={index} className="bg-gray-100 dark:bg-dark-700 rounded-lg p-4 text-center">
                        <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{image}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedLog.followUpRequired && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Follow-up Required</h4>
                  {selectedLog.nextInspectionDue && (
                    <p className="text-yellow-700 dark:text-yellow-300">
                      Next inspection due: {selectedLog.nextInspectionDue.toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blockchain Hash</label>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm font-mono text-green-800 dark:text-green-200 break-all">
                      {selectedLog.blockchainHash}
                    </p>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">Verified on Ethereum blockchain</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Logs</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{logs.length}</p>
            </div>
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Passed</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {logs.filter(l => l.status === 'passed').length}
              </p>
            </div>
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {logs.filter(l => l.status === 'failed').length}
              </p>
            </div>
            <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Follow-up Required</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {logs.filter(l => l.followUpRequired).length}
              </p>
            </div>
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionLogs;