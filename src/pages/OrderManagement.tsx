import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, AlertTriangle, Search, Filter, Eye, Edit } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';

interface Order {
  id: string;
  productName: string;
  productId: string;
  quantity: number;
  customer: string;
  division: string;
  status: 'pending' | 'approved' | 'dispatched' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  orderDate: Date;
  expectedDelivery: Date;
  actualDelivery?: Date;
  totalValue: number;
  notes?: string;
}

const OrderManagement: React.FC = () => {
  const { theme } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Add delay to show loading state and simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock orders data with timestamp to show refresh working
      const mockOrders: Order[] = [
        {
          id: 'ORD-2024-001',
          productName: 'Heavy Duty Rail Joints',
          productId: 'RJ-HD-500',
          quantity: 150,
          customer: 'Central Railway',
          division: 'Mumbai Division',
          status: 'pending',
          priority: 'high',
          orderDate: new Date('2024-01-20'),
          expectedDelivery: new Date('2024-02-15'),
          totalValue: 2250000,
          notes: 'Urgent requirement for track modernization project'
        },
        {
          id: 'ORD-2024-002',
          productName: 'Concrete Sleepers',
          productId: 'CS-STD-1200',
          quantity: 500,
          customer: 'Western Railway',
          division: 'Ahmedabad Division',
          status: 'dispatched',
          priority: 'medium',
          orderDate: new Date('2024-01-15'),
          expectedDelivery: new Date('2024-02-10'),
          totalValue: 1875000,
          notes: 'Standard gauge sleepers for new line construction'
        },
        {
          id: 'ORD-2024-003',
          productName: 'Track Fastening Bolts',
          productId: 'TFB-M24-100',
          quantity: 2000,
          customer: 'Northern Railway',
          division: 'Delhi Division',
          status: 'delivered',
          priority: 'low',
          orderDate: new Date('2024-01-10'),
          expectedDelivery: new Date('2024-02-05'),
          actualDelivery: new Date('2024-02-03'),
          totalValue: 800000,
          notes: 'Maintenance replacement bolts'
        },
        {
          id: 'ORD-2024-004',
          productName: 'Signal Control Boxes',
          productId: 'SCB-DIG-50',
          quantity: 25,
          customer: 'Southern Railway',
          division: 'Chennai Division',
          status: 'approved',
          priority: 'high',
          orderDate: new Date('2024-01-18'),
          expectedDelivery: new Date('2024-02-20'),
          totalValue: 3750000,
          notes: 'Digital signal upgrade project'
        },
        {
          id: 'ORD-2024-005',
          productName: 'Rail Clips',
          productId: 'RC-ELK-1000',
          quantity: 5000,
          customer: 'Eastern Railway',
          division: 'Kolkata Division',
          status: 'cancelled',
          priority: 'medium',
          orderDate: new Date('2024-01-12'),
          expectedDelivery: new Date('2024-02-08'),
          totalValue: 500000,
          notes: 'Order cancelled due to specification changes'
        },
        // Add new order to demonstrate refresh functionality
        {
          id: `ORD-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 900) + 100}`,
          productName: 'Smart Rail Sensors',
          productId: 'SRS-IOT-2024',
          quantity: 200,
          customer: 'Metro Railway',
          division: 'Bangalore Division',
          status: 'pending',
          priority: 'medium',
          orderDate: new Date(),
          expectedDelivery: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
          totalValue: 1800000,
          notes: `New order added on ${new Date().toLocaleString()} - IoT enabled rail monitoring sensors`
        }
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: newStatus,
            actualDelivery: newStatus === 'delivered' ? new Date() : order.actualDelivery
          }
        : order
    ));
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'dispatched':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'dispatched':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Order Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage approved orders, update dispatch and delivery status
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6">
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
            </div>
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dispatched</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {orders.filter(o => o.status === 'dispatched').length}
              </p>
            </div>
            <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
            </div>
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                ₹{(orders.reduce((sum, order) => sum + order.totalValue, 0) / 10000000).toFixed(1)}Cr
              </p>
            </div>
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
              />
            </div>
            <div className="relative">
              <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Loading...' : 'Refresh Orders'}
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{order.id}</h3>
              <div className="flex items-center space-x-2">
                <span className={clsx(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getPriorityColor(order.priority)
                )}>
                  {order.priority}
                </span>
                <span className={clsx(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getStatusColor(order.status)
                )}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1">{order.status}</span>
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Product</p>
                <p className="font-medium text-gray-900 dark:text-white">{order.productName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{order.productId}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Quantity</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.quantity.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Value</p>
                  <p className="font-medium text-gray-900 dark:text-white">₹{(order.totalValue / 100000).toFixed(1)}L</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Customer</p>
                <p className="font-medium text-gray-900 dark:text-white">{order.customer}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{order.division}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expected Delivery</p>
                <p className="font-medium text-gray-900 dark:text-white">{order.expectedDelivery.toLocaleDateString()}</p>
              </div>

              {order.notes && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{order.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700">
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex-1 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </button>
                {order.status === 'approved' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'dispatched')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  >
                    Dispatch
                  </button>
                )}
                {order.status === 'dispatched' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  >
                    Delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Order Details - {selectedOrder.id}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
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
                  <p className="text-gray-900 dark:text-white">{selectedOrder.productName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{selectedOrder.productId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <span className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getStatusColor(selectedOrder.status)
                  )}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1">{selectedOrder.status.toUpperCase()}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                  <p className="text-gray-900 dark:text-white">{selectedOrder.quantity.toLocaleString()} units</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Value</label>
                  <p className="text-gray-900 dark:text-white font-semibold">₹{(selectedOrder.totalValue / 100000).toFixed(1)} Lakhs</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
                  <p className="text-gray-900 dark:text-white">{selectedOrder.customer}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{selectedOrder.division}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <span className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getPriorityColor(selectedOrder.priority)
                  )}>
                    {selectedOrder.priority.toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Date</label>
                  <p className="text-gray-900 dark:text-white">{selectedOrder.orderDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Delivery</label>
                  <p className="text-gray-900 dark:text-white">{selectedOrder.expectedDelivery.toLocaleDateString()}</p>
                </div>
              </div>

              {selectedOrder.actualDelivery && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Actual Delivery</label>
                  <p className="text-gray-900 dark:text-white">{selectedOrder.actualDelivery.toLocaleDateString()}</p>
                </div>
              )}

              {selectedOrder.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                  <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-white">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-4 border-t border-gray-200 dark:border-dark-700">
                {selectedOrder.status === 'approved' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'dispatched');
                      setSelectedOrder(null);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Mark as Dispatched
                  </button>
                )}
                {selectedOrder.status === 'dispatched' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'delivered');
                      setSelectedOrder(null);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default OrderManagement;