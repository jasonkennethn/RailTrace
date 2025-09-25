import React, { useState } from 'react';
import { Send, Plus, Trash2, Package, MapPin, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';

interface ProductRequest {
  productName: string;
  productCategory: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  justification: string;
  section: string;
  estimatedCost: number;
  requiredBy: Date;
}

interface SubmittedRequest {
  id: string;
  products: ProductRequest[];
  submittedDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'partially_approved';
  totalCost: number;
  approvedBy?: string;
  notes?: string;
}

const RequestProducts: React.FC = () => {
  const { theme } = useTheme();
  const [requests, setRequests] = useState<ProductRequest[]>([
    {
      productName: '',
      productCategory: 'Rail Components',
      quantity: 1,
      urgency: 'medium',
      justification: '',
      section: '',
      estimatedCost: 0,
      requiredBy: new Date()
    }
  ]);
  const [submittedRequests, setSubmittedRequests] = useState<SubmittedRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const productCategories = [
    'Rail Components',
    'Signaling Equipment',
    'Fastening Systems',
    'Track Components',
    'Safety Equipment',
    'Maintenance Tools',
    'Electrical Components',
    'Communication Systems'
  ];

  const addRequest = () => {
    setRequests([
      ...requests,
      {
        productName: '',
        productCategory: 'Rail Components',
        quantity: 1,
        urgency: 'medium',
        justification: '',
        section: '',
        estimatedCost: 0,
        requiredBy: new Date()
      }
    ]);
  };

  const removeRequest = (index: number) => {
    if (requests.length > 1) {
      setRequests(requests.filter((_, i) => i !== index));
    }
  };

  const updateRequest = (index: number, field: keyof ProductRequest, value: any) => {
    const updatedRequests = requests.map((request, i) => 
      i === index ? { ...request, [field]: value } : request
    );
    setRequests(updatedRequests);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate all requests
      const validRequests = requests.filter(req => 
        req.productName && req.section && req.justification
      );

      if (validRequests.length === 0) {
        alert('Please fill in at least one complete product request.');
        return;
      }

      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newSubmission: SubmittedRequest = {
        id: `REQ-${Date.now()}`,
        products: validRequests,
        submittedDate: new Date(),
        status: 'pending',
        totalCost: validRequests.reduce((sum, req) => sum + req.estimatedCost, 0)
      };

      setSubmittedRequests([newSubmission, ...submittedRequests]);
      setShowSuccess(true);

      // Reset form
      setRequests([
        {
          productName: '',
          productCategory: 'Rail Components',
          quantity: 1,
          urgency: 'medium',
          justification: '',
          section: '',
          estimatedCost: 0,
          requiredBy: new Date()
        }
      ]);

      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'partially_approved':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (showSuccess) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-8 shadow-sm text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Request Submitted Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your product request has been submitted to the AEN for approval.
          </p>
          <button
            onClick={() => setShowSuccess(false)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Request Products
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Submit product requirement requests to AEN for approval
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Requests</h3>
                <button
                  type="button"
                  onClick={addRequest}
                  className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-6">
                {requests.map((request, index) => (
                  <div key={index} className="border border-gray-200 dark:border-dark-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Product Request #{index + 1}
                      </h4>
                      {requests.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRequest(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Product Name
                        </label>
                        <input
                          type="text"
                          value={request.productName}
                          onChange={(e) => updateRequest(index, 'productName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                          placeholder="Enter product name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Category
                        </label>
                        <select
                          value={request.productCategory}
                          onChange={(e) => updateRequest(index, 'productCategory', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                        >
                          {productCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={request.quantity}
                          onChange={(e) => updateRequest(index, 'quantity', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Urgency
                        </label>
                        <select
                          value={request.urgency}
                          onChange={(e) => updateRequest(index, 'urgency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="emergency">Emergency</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Section
                        </label>
                        <div className="relative">
                          <MapPin className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            value={request.section}
                            onChange={(e) => updateRequest(index, 'section', e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                            placeholder="e.g., Section A-123"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Estimated Cost (₹)
                        </label>
                        <input
                          type="number"
                          value={request.estimatedCost}
                          onChange={(e) => updateRequest(index, 'estimatedCost', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Required By
                        </label>
                        <div className="relative">
                          <Calendar className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                          <input
                            type="date"
                            value={request.requiredBy.toISOString().split('T')[0]}
                            onChange={(e) => updateRequest(index, 'requiredBy', new Date(e.target.value))}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Justification
                        </label>
                        <textarea
                          value={request.justification}
                          onChange={(e) => updateRequest(index, 'justification', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                          placeholder="Explain why this product is needed..."
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-600">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Estimated Cost: ₹{requests.reduce((sum, req) => sum + req.estimatedCost, 0).toLocaleString()}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit Request</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Previous Requests */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Previous Requests</h3>
            
            {submittedRequests.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No previous requests</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {submittedRequests.map((submission) => (
                  <div key={submission.id} className="border border-gray-200 dark:border-dark-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{submission.id}</span>
                      <span className={clsx(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        getStatusColor(submission.status)
                      )}>
                        {submission.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>Products: {submission.products.length}</p>
                      <p>Total Cost: ₹{submission.totalCost.toLocaleString()}</p>
                      <p>Submitted: {submission.submittedDate.toLocaleDateString()}</p>
                    </div>

                    {submission.products.map((product, index) => (
                      <div key={index} className="mt-2 p-2 bg-gray-50 dark:bg-dark-700 rounded text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{product.productName}</span>
                          <span className={clsx(
                            'px-2 py-0.5 rounded-full text-xs',
                            getUrgencyColor(product.urgency)
                          )}>
                            {product.urgency}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Qty: {product.quantity} | {product.section}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {submittedRequests.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Requests</div>
            </div>
            <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {submittedRequests.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestProducts;