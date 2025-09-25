import React, { useState } from 'react';
import { FileCheck, Search, Filter, Download, Eye, Shield, Clock, User } from 'lucide-react';

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

  const auditLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: new Date('2024-01-20T10:30:00'),
      userId: 'user_123',
      userName: 'Inspector John',
      action: 'INSPECTION_CREATED',
      resource: 'Product RJ-456',
      details: 'Created inspection record for rail joint RJ-456',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Mobile)',
      blockchainHash: '0x123abc456def789',
      status: 'success'
    },
    {
      id: '2',
      timestamp: new Date('2024-01-20T09:15:00'),
      userId: 'user_456',
      userName: 'DRM Smith',
      action: 'APPROVAL_GRANTED',
      resource: 'Inspection Report IR-789',
      details: 'Approved inspection report for track section A-123',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows)',
      blockchainHash: '0x456def789abc123',
      status: 'success'
    },
    {
      id: '3',
      timestamp: new Date('2024-01-20T08:45:00'),
      userId: 'user_789',
      userName: 'Admin User',
      action: 'USER_CREATED',
      resource: 'User Account',
      details: 'Created new inspector account for Mumbai Division',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows)',
      status: 'success'
    },
    {
      id: '4',
      timestamp: new Date('2024-01-20T08:30:00'),
      userId: 'user_101',
      userName: 'Manufacturer ABC',
      action: 'PRODUCT_REGISTERED',
      resource: 'Product Batch B-2024',
      details: 'Registered new product batch with 500 rail joints',
      ipAddress: '203.45.67.89',
      userAgent: 'Mozilla/5.0 (Windows)',
      blockchainHash: '0x789abc123def456',
      status: 'success'
    },
    {
      id: '5',
      timestamp: new Date('2024-01-20T07:20:00'),
      userId: 'user_202',
      userName: 'Inspector Jane',
      action: 'LOGIN_FAILED',
      resource: 'Authentication System',
      details: 'Failed login attempt - invalid credentials',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Mobile)',
      status: 'failed'
    }
  ];

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
      ['Timestamp', 'User', 'Action', 'Resource', 'Status', 'IP Address', 'Blockchain Hash'],
      ...filteredLogs.map(log => [
        log.timestamp.toISOString(),
        log.userName,
        log.action,
        log.resource,
        log.status,
        log.ipAddress,
        log.blockchainHash || 'N/A'
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Audit Logs</h1>
        <p className="text-gray-600 dark:text-gray-400">Monitor system activities and blockchain transactions</p>
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
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Blockchain</th>
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
                  <td className="py-4 px-6">
                    {log.blockchainHash ? (
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span className="text-xs font-mono text-gray-600">
                          {log.blockchainHash.substring(0, 10)}...
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <p className="text-sm text-gray-600">Blockchain Records</p>
              <p className="text-2xl font-bold text-gray-900">
                {auditLogs.filter(log => log.blockchainHash).length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;