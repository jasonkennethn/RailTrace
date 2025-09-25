import React, { useState, useEffect } from 'react';
import { Clock, Search, Filter, Eye, CheckCircle, XCircle, MapPin, Calendar, Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';

interface HistoricalInspection {
  id: string;
  productId: string;
  productName: string;
  section: string;
  inspectionDate: Date;
  status: 'passed' | 'failed' | 'requires_attention';
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  findings: string;
  recommendations: string;
  inspectorName: string;
  blockchainHash: string;
  images: string[];
  defects: string[];
  maintenancePerformed: string[];
  nextInspectionDue?: Date;
}

const InspectionHistory: React.FC = () => {
  const { theme } = useTheme();
  const [inspections, setInspections] = useState<HistoricalInspection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [selectedInspection, setSelectedInspection] = useState<HistoricalInspection | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInspectionHistory();
  }, []);

  const loadInspectionHistory = async () => {
    setLoading(true);
    try {
      // Mock historical inspection data
      const mockInspections: HistoricalInspection[] = [
        {
          id: 'HIST-001',
          productId: 'RAIL-JOINT-RJ456',
          productName: 'Heavy Duty Rail Joint',
          section: 'Section A-123',
          inspectionDate: new Date('2024-01-22T10:30:00'),
          status: 'passed',
          condition: 'good',
          findings: 'Rail joint in excellent condition. No visible wear, cracks, or deformation. All bolts properly tightened to specification.',
          recommendations: 'Continue regular monitoring. Next inspection scheduled in 6 months.',
          inspectorName: 'Inspector Kumar',
          blockchainHash: '0x123abc456def789ghi012jkl345mno678pqr901stu234vwx567yza890bcd',
          images: ['joint_overview.jpg', 'bolt_detail.jpg'],
          defects: [],
          maintenancePerformed: ['Cleaning', 'Bolt tightening'],
          nextInspectionDue: new Date('2024-07-22')
        },
        {
          id: 'HIST-002',
          productId: 'SIGNAL-BOX-SB789',
          productName: 'Digital Signal Control Box',
          section: 'Section B-456',
          inspectionDate: new Date('2024-01-15T14:15:00'),
          status: 'requires_attention',
          condition: 'fair',
          findings: 'Signal box housing shows minor corrosion on external panels. Internal components functioning normally.',
          recommendations: 'Schedule maintenance to address corrosion. Replace external housing panels.',
          inspectorName: 'Inspector Sharma',
          blockchainHash: '0x456def789abc123ghi456jkl789mno012pqr345stu678vwx901yza234bcd',
          images: ['signal_exterior.jpg', 'corrosion_detail.jpg'],
          defects: ['Corrosion'],
          maintenancePerformed: ['Cleaning', 'Lubrication'],
          nextInspectionDue: new Date('2024-02-15')
        },
        {
          id: 'HIST-003',
          productId: 'TRACK-BOLT-TB321',
          productName: 'High Tensile Track Bolt',
          section: 'Section C-789',
          inspectionDate: new Date('2024-01-10T09:45:00'),
          status: 'failed',
          condition: 'poor',
          findings: 'Multiple track bolts showing signs of fatigue and stress fractures. Torque values below specification.',
          recommendations: 'URGENT: Replace all affected bolts immediately. Conduct stress analysis of surrounding area.',
          inspectorName: 'Inspector Patel',
          blockchainHash: '0x789abc123def456ghi789jkl012mno345pqr678stu901vwx234yza567bcd',
          images: ['bolt_fracture.jpg', 'stress_analysis.jpg'],
          defects: ['Cracks', 'Loose bolts', 'Wear'],
          maintenancePerformed: [],
          nextInspectionDue: new Date('2024-01-25')
        },
        {
          id: 'HIST-004',
          productId: 'SLEEPER-SL654',
          productName: 'Prestressed Concrete Sleeper',
          section: 'Section A-123',
          inspectionDate: new Date('2024-01-05T16:20:00'),
          status: 'passed',
          condition: 'excellent',
          findings: 'Concrete sleepers in excellent condition. No visible cracks, spalling, or structural damage.',
          recommendations: 'Continue current maintenance schedule. Monitor for any signs of deterioration.',
          inspectorName: 'Inspector Singh',
          blockchainHash: '0x012jkl345mno678pqr901stu234vwx567yza890bcd123abc456def789ghi',
          images: ['sleeper_overview.jpg', 'rail_seat_detail.jpg'],
          defects: [],
          maintenancePerformed: ['Cleaning'],
          nextInspectionDue: new Date('2024-04-05')
        },
        {
          id: 'HIST-005',
          productId: 'RAIL-JOINT-RJ456',
          productName: 'Heavy Duty Rail Joint',
          section: 'Section A-123',
          inspectionDate: new Date('2023-12-22T11:00:00'),
          status: 'passed',
          condition: 'good',
          findings: 'Previous inspection showed good condition with minor wear patterns. All components functioning properly.',
          recommendations: 'Continue monitoring. Schedule next inspection as per maintenance calendar.',
          inspectorName: 'Inspector Kumar',
          blockchainHash: '0x345mno678pqr901stu234vwx567yza890bcd123abc456def789ghi012jkl',
          images: ['previous_joint.jpg'],
          defects: ['Minor wear'],
          maintenancePerformed: ['Cleaning', 'Lubrication'],
          nextInspectionDue: new Date('2024-01-22')
        }
      ];

      setInspections(mockInspections);
    } catch (error) {
      console.error('Error loading inspection history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.section.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
    const matchesSection = sectionFilter === 'all' || inspection.section === sectionFilter;
    return matchesSearch && matchesStatus && matchesSection;
  });

  const sections = [...new Set(inspections.map(i => i.section))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'requires_attention':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'poor':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Inspection History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View previous inspections for assigned sections - blockchain verified
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
                placeholder="Search inspections..."
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
              </select>
            </div>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Sections</option>
              {sections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
          <button
            onClick={loadInspectionHistory}
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Loading...' : 'Refresh History'}
          </button>
        </div>
      </div>

      {/* Inspections Timeline */}
      <div className="space-y-4 mb-6">
        {filteredInspections.map((inspection, index) => (
          <div
            key={inspection.id}
            className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in cursor-pointer"
            onClick={() => setSelectedInspection(inspection)}
          >
            <div className="flex items-start space-x-4">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div className={clsx(
                  'w-3 h-3 rounded-full',
                  inspection.status === 'passed' ? 'bg-green-500' :
                  inspection.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                )} />
                {index < filteredInspections.length - 1 && (
                  <div className="w-0.5 h-16 bg-gray-200 dark:bg-dark-600 mt-2" />
                )}
              </div>

              {/* Inspection content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {inspection.id}
                    </h3>
                    <span className={clsx(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      getStatusColor(inspection.status)
                    )}>
                      {getStatusIcon(inspection.status)}
                      <span className="ml-1">{inspection.status.replace('_', ' ')}</span>
                    </span>
                    <span className={clsx(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      getConditionColor(inspection.condition)
                    )}>
                      {inspection.condition}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400">Blockchain Verified</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Product</p>
                    <p className="font-medium text-gray-900 dark:text-white">{inspection.productName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{inspection.productId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Section</p>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{inspection.section}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Inspector</p>
                    <p className="font-medium text-gray-900 dark:text-white">{inspection.inspectorName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {inspection.inspectionDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Findings</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{inspection.findings}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {inspection.defects.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-600 dark:text-red-400">
                          {inspection.defects.length} defect{inspection.defects.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {inspection.maintenancePerformed.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-600 dark:text-green-400">
                          {inspection.maintenancePerformed.length} maintenance action{inspection.maintenancePerformed.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {inspection.images.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          {inspection.images.length} image{inspection.images.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  <Eye className="h-4 w-4 text-primary-600" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inspection Detail Modal */}
      {selectedInspection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Inspection Details - {selectedInspection.id}
                </h2>
                <button
                  onClick={() => setSelectedInspection(null)}
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
                  <p className="text-gray-900 dark:text-white">{selectedInspection.productName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{selectedInspection.productId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status & Condition</label>
                  <div className="flex items-center space-x-2">
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStatusColor(selectedInspection.status)
                    )}>
                      {getStatusIcon(selectedInspection.status)}
                      <span className="ml-1">{selectedInspection.status.replace('_', ' ').toUpperCase()}</span>
                    </span>
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getConditionColor(selectedInspection.condition)
                    )}>
                      {selectedInspection.condition.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inspector</label>
                  <p className="text-gray-900 dark:text-white">{selectedInspection.inspectorName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                  <p className="text-gray-900 dark:text-white">{selectedInspection.section}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inspection Date</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedInspection.inspectionDate.toLocaleDateString()} at {selectedInspection.inspectionDate.toLocaleTimeString()}
                  </p>
                </div>
                {selectedInspection.nextInspectionDue && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Inspection Due</label>
                    <p className="text-gray-900 dark:text-white">{selectedInspection.nextInspectionDue.toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Findings</label>
                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-white">{selectedInspection.findings}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations</label>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-white">{selectedInspection.recommendations}</p>
                </div>
              </div>

              {selectedInspection.defects.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Defects Identified</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedInspection.defects.map((defect, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      >
                        {defect}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedInspection.maintenancePerformed.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Maintenance Performed</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedInspection.maintenancePerformed.map((maintenance, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        {maintenance}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedInspection.images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Inspection Images ({selectedInspection.images.length})
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedInspection.images.map((image, index) => (
                      <div key={index} className="bg-gray-100 dark:bg-dark-700 rounded-lg p-4 text-center">
                        <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{image}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blockchain Hash</label>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <p className="text-sm font-mono text-green-800 dark:text-green-200 break-all">
                      {selectedInspection.blockchainHash}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Inspections</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{inspections.length}</p>
            </div>
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Passed</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {inspections.filter(i => i.status === 'passed').length}
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
                {inspections.filter(i => i.status === 'failed').length}
              </p>
            </div>
            <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Blockchain Verified</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{inspections.length}</p>
            </div>
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionHistory;