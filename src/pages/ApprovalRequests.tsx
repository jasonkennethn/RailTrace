import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, DollarSign, FileText, User, Calendar, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ApprovalRequestsService } from '../services/dataService';

interface ApprovalRequest {
  id: string;
  type: 'product' | 'budget' | 'maintenance' | 'project';
  title: string;
  requestedBy: string;
  requestedByRole: string;
  amount?: number;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  documents?: string[];
  category?: string;
  productType?: string;
  manufacturer?: string;
  manufacturerRating?: number;
  qualityScore?: number;
  deliveryScore?: number;
  costScore?: number;
  overallScore?: number;
  approvedBy?: string;
  approvedAt?: Date;
  warrantyExpiry?: Date;
  estimatedDelivery?: Date;
}

const ApprovalRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [manufacturerFilter, setManufacturerFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time data subscription
    const unsubscribe = ApprovalRequestsService.subscribeToApprovalRequests((fetchedRequests) => {
      setRequests(fetchedRequests);
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
            <p className="text-gray-600">Loading approval requests...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleApproval = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const targetRequest = requests.find(req => req.id === requestId);
      if (!targetRequest) return;

      // Calculate warranty expiry and delivery estimates for approved product/maintenance requests
      const updates: Partial<ApprovalRequest> = {
        status: action === 'approve' ? 'approved' : 'rejected'
      };

      if (action === 'approve' && (targetRequest.type === 'product' || targetRequest.type === 'maintenance')) {
        // Calculate warranty expiry based on product type and priority
        const baseWarrantyDays = targetRequest.type === 'product' ? 365 : 180; // 1 year for products, 6 months for maintenance
        const priorityMultiplier = targetRequest.priority === 'high' ? 1.5 : targetRequest.priority === 'medium' ? 1.2 : 1.0;
        const warrantyDays = Math.floor(baseWarrantyDays * priorityMultiplier);
        
        updates.warrantyExpiry = new Date(Date.now() + warrantyDays * 24 * 60 * 60 * 1000);
        
        // Calculate estimated delivery (1-4 weeks based on priority)
        const deliveryDays = targetRequest.priority === 'high' ? 7 : targetRequest.priority === 'medium' ? 14 : 28;
        updates.estimatedDelivery = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000);
      }

      // Update via service (this will handle persistence)
      await ApprovalRequestsService.updateApprovalRequest(requestId, updates, user?.name);
      
      // Close modal if it was the selected request
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(null);
      }
      
    } catch (error) {
      console.error('Error updating approval request:', error);
      alert('Failed to update request status. Please try again.');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = filter === 'all' || req.status === filter;
    const matchesCategory = categoryFilter === 'all' || req.category === categoryFilter;
    const matchesManufacturer = manufacturerFilter === 'all' || req.manufacturer === manufacturerFilter;
    return matchesStatus && matchesCategory && matchesManufacturer;
  }).sort((a, b) => {
    // Sort by selected criteria (higher ratings/scores first)
    switch (sortBy) {
      case 'rating':
        return (b.manufacturerRating || 0) - (a.manufacturerRating || 0);
      case 'quality':
        return (b.qualityScore || 0) - (a.qualityScore || 0);
      case 'delivery':
        return (b.deliveryScore || 0) - (a.deliveryScore || 0);
      case 'cost':
        return (b.costScore || 0) - (a.costScore || 0);
      case 'overall':
        return (b.overallScore || 0) - (a.overallScore || 0);
      default:
        return (b.manufacturerRating || 0) - (a.manufacturerRating || 0);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'budget': return <DollarSign className="h-5 w-5" />;
      case 'product': return <FileText className="h-5 w-5" />;
      case 'maintenance': return <AlertTriangle className="h-5 w-5" />;
      case 'project': return <CheckCircle className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Approval Requests</h1>
        <p className="text-gray-600 dark:text-gray-400">Review and process approval requests from your team</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as any)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  <span className="ml-1 text-xs">
                    ({status === 'all' ? requests.length : requests.filter(r => r.status === status).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category/Product Type</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="all">All Categories</option>
              <option value="Rail Joints">Rail Joints</option>
              <option value="Track Bolts">Track Bolts</option>
              <option value="Sleepers">Sleepers</option>
              <option value="Signal Equipment">Signal Equipment</option>
              <option value="Safety Equipment">Safety Equipment</option>
              <option value="Maintenance Tools">Maintenance Tools</option>
            </select>
          </div>

          {/* Manufacturer Filter with AI Ratings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Star className="h-4 w-4 inline mr-1 text-yellow-500" />
              Manufacturer (AI Rated)
            </label>
            <select
              value={manufacturerFilter}
              onChange={(e) => setManufacturerFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="all">All Manufacturers</option>
              <option value="Steel Works India Ltd.">🌟 Steel Works India Ltd. (4.8⭐)</option>
              <option value="Indian Rail Manufacturing">🌟 Indian Rail Manufacturing (4.6⭐)</option>
              <option value="Bharat Heavy Electricals">🌟 Bharat Heavy Electricals (4.5⭐)</option>
              <option value="Kalindee Rail Nirman">⭐ Kalindee Rail Nirman (4.3⭐)</option>
              <option value="Railway Components Corp.">⭐ Railway Components Corp. (4.2⭐)</option>
              <option value="Texmaco Rail & Engineering">⚡ Texmaco Rail & Engineering (3.9⭐)</option>
            </select>
          </div>

          {/* Sort by AI Metrics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TrendingUp className="h-4 w-4 inline mr-1 text-blue-500" />
              Sort by AI Metrics
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="rating">Overall Rating</option>
              <option value="quality">Quality Score</option>
              <option value="delivery">Delivery Performance</option>
              <option value="cost">Cost Efficiency</option>
              <option value="overall">Overall Performance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRequests.map((request) => (
          <div
            key={request.id}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedRequest(request)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="text-blue-600">
                  {getTypeIcon(request.type)}
                </div>
                <span className="font-medium text-gray-900 capitalize">{request.type}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                  {request.priority}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{request.title}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{request.requestedBy} ({request.requestedByRole})</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{request.createdAt.toLocaleDateString()}</span>
              </div>
              {request.amount && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>₹{(request.amount / 100000).toFixed(1)}L</span>
                </div>
              )}
              {request.manufacturer && request.manufacturerRating && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{request.manufacturer} ({request.manufacturerRating.toFixed(1)}⭐)</span>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-700 mb-4 line-clamp-3">{request.description}</p>

            {request.status === 'pending' && (
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApproval(request.id, 'approve');
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApproval(request.id, 'reject');
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.title}</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
                  <div className="flex items-center space-x-2">
                    <div className="text-blue-600">
                      {getTypeIcon(selectedRequest.type)}
                    </div>
                    <span className="capitalize font-medium">{selectedRequest.type}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status.toUpperCase()}
                  </span>
                </div>
                {selectedRequest.category && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <p className="text-gray-900">{selectedRequest.category}</p>
                  </div>
                )}
                {selectedRequest.manufacturer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-900">{selectedRequest.manufacturer}</p>
                      {selectedRequest.manufacturerRating && (
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star className="h-4 w-4" />
                          <span className="text-sm font-medium">{selectedRequest.manufacturerRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requested By</label>
                  <p className="text-gray-900">{selectedRequest.requestedBy} ({selectedRequest.requestedByRole})</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedRequest.priority)}`}>
                    {selectedRequest.priority.toUpperCase()}
                  </span>
                </div>
                {selectedRequest.amount && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <p className="text-gray-900 font-semibold">₹{(selectedRequest.amount / 100000).toFixed(1)} Lakhs</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                  <p className="text-gray-900">{selectedRequest.createdAt.toLocaleDateString()}</p>
                </div>
                {selectedRequest.approvedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Approved Date</label>
                    <p className="text-gray-900">{selectedRequest.approvedAt.toLocaleDateString()}</p>
                  </div>
                )}
                {selectedRequest.approvedBy && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Approved By</label>
                    <p className="text-gray-900">{selectedRequest.approvedBy}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900">{selectedRequest.description}</p>
                </div>
              </div>

              {/* AI Manufacturer Metrics */}
              {selectedRequest.manufacturerRating && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <TrendingUp className="h-4 w-4 inline mr-1 text-blue-500" />
                    AI Manufacturer Performance Metrics
                  </label>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-lg font-bold text-gray-900">{selectedRequest.manufacturerRating.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-gray-600">Overall Rating</p>
                      </div>
                      {selectedRequest.qualityScore && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{selectedRequest.qualityScore.toFixed(1)}</div>
                          <p className="text-xs text-gray-600">Quality</p>
                        </div>
                      )}
                      {selectedRequest.deliveryScore && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{selectedRequest.deliveryScore.toFixed(1)}</div>
                          <p className="text-xs text-gray-600">Delivery</p>
                        </div>
                      )}
                      {selectedRequest.costScore && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{selectedRequest.costScore.toFixed(1)}</div>
                          <p className="text-xs text-gray-600">Cost Efficiency</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Warranty and Delivery Information for Approved Requests */}
              {selectedRequest.status === 'approved' && (selectedRequest.warrantyExpiry || selectedRequest.estimatedDelivery) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CheckCircle className="h-4 w-4 inline mr-1 text-green-500" />
                    Approval Details
                  </label>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRequest.estimatedDelivery && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {selectedRequest.estimatedDelivery.toLocaleDateString()}
                          </div>
                          <p className="text-xs text-gray-600">Estimated Delivery</p>
                        </div>
                      )}
                      {selectedRequest.warrantyExpiry && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {selectedRequest.warrantyExpiry.toLocaleDateString()}
                          </div>
                          <p className="text-xs text-gray-600">Warranty Expiry</p>
                          <p className="text-xs text-gray-500 mt-1">
                            ({Math.ceil((selectedRequest.warrantyExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Documents</label>
                  <div className="space-y-2">
                    {selectedRequest.documents.map((doc, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="flex space-x-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleApproval(selectedRequest.id, 'approve')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Approve Request</span>
                  </button>
                  <button
                    onClick={() => handleApproval(selectedRequest.id, 'reject')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <XCircle className="h-5 w-5" />
                    <span>Reject Request</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalRequests;