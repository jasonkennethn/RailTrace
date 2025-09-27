import React, { useState, useEffect } from 'react';
import { FileCheck, Search, Filter, Download, Eye, Shield, Clock, User, BarChart3, TrendingUp } from 'lucide-react';
import { AuditLogsService } from '../services/dataService';
import ChartContainer from '../components/charts/ChartContainer';

interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  blockchainHash?: string;
  status: 'success' | 'failed' | 'pending';
}

const AuditLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7days');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time data subscription
    const unsubscribe = AuditLogsService.subscribeToAuditLogs((fetchedLogs) => {
      setAuditLogs(fetchedLogs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading audit logs...</p>
          </div>
        </div>
      </div>
    );
  }

  const actions = [
    'INSPECTION_CREATED',
    'APPROVAL_GRANTED',
    'USER_CREATED',
    'PRODUCT_REGISTERED',
    'LOGIN_FAILED',
    'SETTINGS_MODIFIED',
    'REPORT_GENERATED'
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;
    const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;
    return matchesSearch && matchesAction && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('INSPECTION')) return <Eye className="h-4 w-4" />;
    if (action.includes('USER')) return <User className="h-4 w-4" />;
    if (action.includes('APPROVAL')) return <FileCheck className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Status', 'IP Address'],
      ...filteredLogs.map(log => [
        log.timestamp.toISOString(),
        log.userName,
        log.action,
        log.resource,
        log.status,
        log.ipAddress
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_logs.csv';
    a.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Audit Logs & Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">Monitor system activities, security events, and generate analytical reports</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Actions</option>
            {actions.map(action => (
              <option key={action} value={action}>{action.replace('_', ' ')}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1day">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
          <button
            onClick={exportLogs}
            className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Action Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Action Distribution</h3>
          </div>
          <ChartContainer
            type="pie"
            data={actions.map(action => ({
              name: action.replace('_', ' '),
              value: auditLogs.filter(log => log.action === action).length
            })).filter(item => item.value > 0)}
            title=""
            height={250}
          />
        </div>

        {/* Activity Timeline Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Daily Activity</h3>
          </div>
          <ChartContainer
            type="line"
            data={(() => {
              const last7Days = Array.from({length: 7}, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                return {
                  name: date.toLocaleDateString('en-US', {weekday: 'short'}),
                  value: auditLogs.filter(log => {
                    const logDate = new Date(log.timestamp);
                    return logDate.toDateString() === date.toDateString();
                  }).length
                };
              });
              return last7Days;
            })()
            }
            title=""
            height={250}
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{auditLogs.length}</p>
            </div>
            <FileCheck className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Successful Actions</p>
              <p className="text-2xl font-bold text-gray-900">
                {auditLogs.filter(log => log.status === 'success').length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed Actions</p>
              <p className="text-2xl font-bold text-gray-900">
                {auditLogs.filter(log => log.status === 'failed').length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unique Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(auditLogs.map(log => log.userId)).size}
              </p>
            </div>
            <User className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Timestamp</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">User</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Action</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Resource</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {log.timestamp.toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {log.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{log.userName}</p>
                      <p className="text-xs text-gray-600">{log.ipAddress}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {getActionIcon(log.action)}
                      <span className="text-sm font-medium text-gray-900">
                        {log.action.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{log.resource}</p>
                      <p className="text-xs text-gray-600">{log.details}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;