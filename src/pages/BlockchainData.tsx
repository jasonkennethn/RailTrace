import React, { useState, useEffect } from 'react';
import { Database, Search, Filter, Download, Eye, Calendar, User, Package, CheckCircle, AlertTriangle } from 'lucide-react';
import { ApprovalRequestsService, ProductsService, InspectionsService, UsersService } from '../services/dataService';

interface BlockchainDataEntry {
  id: string;
  approvalDate: Date;
  approvedBy: string;
  requestedBy: string;
  deliveryTime: string;
  approvedTime: Date;
  warrantyExpiry: Date;
  budget: number;
  manufacturerName: string;
  section: string;
  urgency: 'low' | 'medium' | 'high';
  quantity: number;
  productCategory: string;
  productName: string;
  status: 'approved' | 'delivered' | 'installed' | 'inspected';
  blockchainHash: string;
}

const BlockchainData: React.FC = () => {
  const [blockchainData, setBlockchainData] = useState<BlockchainDataEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<BlockchainDataEntry | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    try {
      // Simulate blockchain data by combining data from different services
      const approvalRequests = await ApprovalRequestsService.getApprovalRequests();
      const products = await ProductsService.getProducts();
      const users = await UsersService.getUsers();

      // Generate blockchain-like data entries
      const blockchainEntries: BlockchainDataEntry[] = approvalRequests
        .filter(req => req.status === 'approved')
        .map((request, index) => {
          const product = products[index % products.length];
          const approver = users.find(u => u.role === 'den') || users[0];
          const requester = users.find(u => u.role === 'inspector') || users[1];
          
          return {
            id: `BC-${Date.now()}-${index}`,
            approvalDate: request.createdAt,
            approvedBy: approver.name,
            requestedBy: requester.name,
            deliveryTime: `${Math.floor(Math.random() * 10) + 1} days`,
            approvedTime: new Date(request.createdAt.getTime() + 24 * 60 * 60 * 1000),
            warrantyExpiry: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000) + (Math.random() * 365 * 24 * 60 * 60 * 1000)),
            budget: request.amount || Math.floor(Math.random() * 1000000) + 100000,
            manufacturerName: product?.manufacturer || 'ABC Manufacturing Ltd.',
            section: `Section ${String.fromCharCode(65 + index % 6)}-${100 + index}`,
            urgency: request.priority,
            quantity: Math.floor(Math.random() * 100) + 1,
            productCategory: product?.category || 'Rail Components',
            productName: product?.name || request.title,
            status: ['approved', 'delivered', 'installed', 'inspected'][Math.floor(Math.random() * 4)] as any,
            blockchainHash: `0x${Math.random().toString(16).substring(2, 66)}`
          };
        });

      setBlockchainData(blockchainEntries);
    } catch (error) {
      console.error('Error loading blockchain data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = blockchainData.filter(entry => {
    const matchesSearch = entry.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.manufacturerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.approvedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.section.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || entry.urgency === urgencyFilter;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-yellow-100 text-yellow-800';
      case 'installed':
        return 'bg-green-100 text-green-800';
      case 'inspected':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Approval Date', 'Approved By', 'Requested By', 'Delivery Time', 'Warranty Expiry', 'Budget', 'Manufacturer', 'Section', 'Urgency', 'Quantity', 'Product Category', 'Product Name', 'Status'],
      ...filteredData.map(entry => [
        entry.approvalDate.toLocaleDateString(),
        entry.approvedBy,
        entry.requestedBy,
        entry.deliveryTime,
        entry.warrantyExpiry.toLocaleDateString(),
        entry.budget.toString(),
        entry.manufacturerName,
        entry.section,
        entry.urgency,
        entry.quantity.toString(),
        entry.productCategory,
        entry.productName,
        entry.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blockchain_data.csv';
    a.click();
  };

  const viewDetails = (entry: BlockchainDataEntry) => {
    setSelectedEntry(entry);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blockchain data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Blockchain Data</h1>
        <p className="text-gray-600 dark:text-gray-400">Complete blockchain-verified transaction and approval records</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search blockchain data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="delivered">Delivered</option>
            <option value="installed">Installed</option>
            <option value="inspected">Inspected</option>
          </select>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Urgency</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={exportData}
            className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={loadBlockchainData}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{blockchainData.length}</p>
            </div>
            <Database className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {blockchainData.filter(entry => entry.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {blockchainData.filter(entry => entry.urgency === 'high').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{Math.round(blockchainData.reduce((sum, entry) => sum + entry.budget, 0) / 100000)}L
              </p>
            </div>
            <Package className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Approval Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Approved By</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Requested By</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Product</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Warranty Expiry</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Budget</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Section</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Urgency</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {entry.approvalDate.toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {entry.approvalDate.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{entry.approvedBy}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">{entry.requestedBy}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{entry.productName}</p>
                      <p className="text-xs text-gray-600">{entry.productCategory}</p>
                      <p className="text-xs text-gray-600">Qty: {entry.quantity}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">{entry.warrantyExpiry.toLocaleDateString()}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-900">₹{entry.budget.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">{entry.section}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(entry.urgency)}`}>
                      {entry.urgency.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                      {entry.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => viewDetails(entry)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Information</h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedEntry(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                    <p className="text-gray-900 dark:text-white font-semibold">{selectedEntry.productName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <p className="text-gray-900 dark:text-white">{selectedEntry.productCategory}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manufacturer</label>
                    <p className="text-gray-900 dark:text-white">{selectedEntry.manufacturerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                    <p className="text-gray-900 dark:text-white">{selectedEntry.quantity}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                    <p className="text-gray-900 dark:text-white">{selectedEntry.section}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urgency</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(selectedEntry.urgency)}`}>
                      {selectedEntry.urgency.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Approved By</label>
                    <p className="text-gray-900 dark:text-white">{selectedEntry.approvedBy}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requested By</label>
                    <p className="text-gray-900 dark:text-white">{selectedEntry.requestedBy}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Approval Date</label>
                    <p className="text-gray-900 dark:text-white">{selectedEntry.approvalDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Time</label>
                    <p className="text-gray-900 dark:text-white">{selectedEntry.deliveryTime}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warranty Expiry</label>
                    <p className="text-gray-900 dark:text-white">{selectedEntry.warrantyExpiry.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget</label>
                    <p className="text-gray-900 dark:text-white font-semibold">₹{selectedEntry.budget.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blockchain Hash</label>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  <code className="text-sm text-gray-900 dark:text-white font-mono break-all">
                    {selectedEntry.blockchainHash}
                  </code>
                </div>
              </div>

              <div className="flex items-center justify-center pt-4 border-t border-gray-200 dark:border-gray-600">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedEntry.status)}`}>
                  {selectedEntry.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainData;