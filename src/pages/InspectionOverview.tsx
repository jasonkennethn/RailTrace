import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Clock, MapPin, Camera, FileText, RefreshCw, Filter } from 'lucide-react';
import { Inspection } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';

const InspectionOverview: React.FC = () => {
  const { theme } = useTheme();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed' | 'pending'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    setLoading(true);
    try {
      // Mock inspections data
      const mockInspections: Inspection[] = [
        {
          id: 'INS-001',
          productId: 'RAIL-JOINT-RJ456',
          inspectorId: 'inspector_123',
          inspectorName: 'Inspector John Smith',
          date: new Date('2024-01-20T10:30:00'),
          status: 'passed',
          notes: 'Rail joint in excellent condition. No visible wear or damage. Bolts properly tightened.',
          images: ['inspection1.jpg', 'inspection2.jpg'],
          blockchainHash: '0x123abc456def789ghi012jkl345mno678pqr901stu234vwx567yza890bcd',
          location: 'Track Section A-123, Mumbai Division'
        },
        {
          id: 'INS-002',
          productId: 'SIGNAL-BOX-SB789',
          inspectorId: 'inspector_456',
          inspectorName: 'Inspector Jane Doe',
          date: new Date('2024-01-19T14:15:00'),
          status: 'failed',
          notes: 'Signal box showing signs of corrosion on external housing. Requires immediate maintenance.',
          images: ['inspection3.jpg'],
          blockchainHash: '0x456def789abc123ghi456jkl789mno012pqr345stu678vwx901yza234bcd',
          location: 'Signal Post SP-45, Delhi Division'
        },
        {
          id: 'INS-003',
          productId: 'TRACK-BOLT-TB321',
          inspectorId: 'inspector_789',
          inspectorName: 'Inspector Mike Wilson',
          date: new Date('2024-01-18T09:45:00'),
          status: 'pending',
          notes: 'Inspection in progress. Awaiting final measurements and documentation.',
          images: [],
          blockchainHash: '0x789abc123def456ghi789jkl012mno345pqr678stu901vwx234yza567bcd',
          location: 'Track Section B-456, Chennai Division'
        },
        {
          id: 'INS-004',
          productId: 'SLEEPER-SL654',
          inspectorId: 'inspector_101',
          inspectorName: 'Inspector Sarah Brown',
          date: new Date('2024-01-17T16:20:00'),
          status: 'passed',
          notes: 'Concrete sleeper in good condition. No cracks or structural damage observed.',
          images: ['inspection4.jpg', 'inspection5.jpg', 'inspection6.jpg'],
          blockchainHash: '0x012jkl345mno678pqr901stu234vwx567yza890bcd123abc456def789ghi',
          location: 'Track Section C-789, Kolkata Division'
        }
      ];

      setInspections(mockInspections);
    } catch (error) {
      console.error('Error loading inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInspections = inspections.filter(inspection => 
    filter === 'all' || inspection.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
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
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Inspection Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor inspection logs submitted by Field Inspectors
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap gap-2">
            {['all', 'passed', 'failed', 'pending'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={clsx(
                  'px-4 py-2 rounded-lg font-medium transition-colors text-sm',
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-2 text-xs">
                  ({status === 'all' ? inspections.length : inspections.filter(i => i.status === status).length})
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={loadInspections}
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className={clsx('h-4 w-4', loading && 'animate-spin')} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Inspections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {filteredInspections.map((inspection) => (
          <div
            key={inspection.id}
            className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer animate-fade-in"
            onClick={() => setSelectedInspection(inspection)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{inspection.id}</h3>
              <div className="flex items-center space-x-2">
                {getStatusIcon(inspection.status)}
                <span className={clsx(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  getStatusColor(inspection.status)
                )}>
                  {inspection.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Product ID</p>
                <p className="font-medium text-gray-900 dark:text-white">{inspection.productId}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Inspector</p>
                <p className="font-medium text-gray-900 dark:text-white">{inspection.inspectorName}</p>
              </div>

              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">{inspection.location}</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {inspection.date.toLocaleDateString()}
                </p>
                <div className="flex items-center space-x-2">
                  {inspection.images.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Camera className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{inspection.images.length}</span>
                    </div>
                  )}
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
          <div className="bg-white dark:bg-dark-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Inspection Details - {selectedInspection.id}
                </h2>
                <button
                  onClick={() => setSelectedInspection(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product ID</label>
                  <p className="text-gray-900 dark:text-white">{selectedInspection.productId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedInspection.status)}
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStatusColor(selectedInspection.status)
                    )}>
                      {selectedInspection.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inspector</label>
                  <p className="text-gray-900 dark:text-white">{selectedInspection.inspectorName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedInspection.date.toLocaleDateString()} at {selectedInspection.date.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900 dark:text-white">{selectedInspection.location}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Inspection Notes</label>
                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <p className="text-gray-900 dark:text-white">{selectedInspection.notes}</p>
                  </div>
                </div>
              </div>

              {selectedInspection.images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Inspection Images ({selectedInspection.images.length})
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedInspection.images.map((image, index) => (
                      <div key={index} className="bg-gray-100 dark:bg-dark-700 rounded-lg p-4 text-center">
                        <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{image}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blockchain Hash</label>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <p className="text-sm font-mono text-blue-800 dark:text-blue-200 break-all">
                      {selectedInspection.blockchainHash}
                    </p>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Verified on Ethereum blockchain</p>
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{inspections.length}</p>
            </div>
            <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {inspections.filter(i => i.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionOverview;