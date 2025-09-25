import React, { useState } from 'react';
import { Package, Plus, Search, Filter, Edit, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Product } from '../types';

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const products: Product[] = [
    {
      id: 'RAIL-JOINT-RJ456',
      name: 'Heavy Duty Rail Joint',
      category: 'Rail Components',
      manufacturer: 'Steel Works India Ltd.',
      batchNumber: 'BATCH2024-001',
      qrCode: 'QR-RJ456-2024',
      blockchainHash: '0x123abc456def789ghi012jkl345mno678pqr901stu234vwx567yza890bcd',
      manufacturedDate: new Date('2024-01-15'),
      status: 'installed',
      location: 'Track Section A-123, Mumbai Division'
    },
    {
      id: 'SIGNAL-BOX-SB789',
      name: 'Digital Signal Control Box',
      category: 'Signaling Equipment',
      manufacturer: 'Railway Electronics Corp.',
      batchNumber: 'BATCH2024-002',
      qrCode: 'QR-SB789-2024',
      blockchainHash: '0x456def789abc123ghi456jkl789mno012pqr345stu678vwx901yza234bcd',
      manufacturedDate: new Date('2024-01-10'),
      status: 'maintenance',
      location: 'Signal Post SP-45, Delhi Division'
    },
    {
      id: 'TRACK-BOLT-TB321',
      name: 'High Tensile Track Bolt',
      category: 'Fastening Systems',
      manufacturer: 'Precision Fasteners Ltd.',
      batchNumber: 'BATCH2024-003',
      qrCode: 'QR-TB321-2024',
      blockchainHash: '0x789abc123def456ghi789jkl012mno345pqr678stu901vwx234yza567bcd',
      manufacturedDate: new Date('2024-01-12'),
      status: 'dispatched',
      location: 'In Transit to Chennai Division'
    },
    {
      id: 'SLEEPER-SL654',
      name: 'Prestressed Concrete Sleeper',
      category: 'Track Components',
      manufacturer: 'Concrete Solutions India',
      batchNumber: 'BATCH2024-004',
      qrCode: 'QR-SL654-2024',
      blockchainHash: '0x012jkl345mno678pqr901stu234vwx567yza890bcd123abc456def789ghi',
      manufacturedDate: new Date('2024-01-08'),
      status: 'installed',
      location: 'Track Section C-789, Kolkata Division'
    },
    {
      id: 'SWITCH-SW987',
      name: 'Automatic Track Switch',
      category: 'Track Components',
      manufacturer: 'Advanced Rail Systems',
      batchNumber: 'BATCH2024-005',
      qrCode: 'QR-SW987-2024',
      blockchainHash: '0x345mno678pqr901stu234vwx567yza890bcd123abc456def789ghi012jkl',
      manufacturedDate: new Date('2024-01-05'),
      status: 'manufactured',
      location: 'Warehouse - Mumbai'
    }
  ];

  const categories = ['Rail Components', 'Signaling Equipment', 'Fastening Systems', 'Track Components'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'manufactured':
        return 'bg-blue-100 text-blue-800';
      case 'dispatched':
        return 'bg-yellow-100 text-yellow-800';
      case 'installed':
        return 'bg-green-100 text-green-800';
      case 'inspected':
        return 'bg-purple-100 text-purple-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'manufactured':
      case 'installed':
      case 'inspected':
        return <CheckCircle className="h-4 w-4" />;
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const handleSave = () => {
    if (editingProduct) {
      // Here you would typically update the product in your backend
      console.log('Saving product:', editingProduct);
      setEditingProduct(null);
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Inventory Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Track and manage railway products across their lifecycle</p>
      </div>

      {/* Header Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="relative">
              <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="manufactured">Manufactured</option>
              <option value="dispatched">Dispatched</option>
              <option value="installed">Installed</option>
              <option value="inspected">Inspected</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <button className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-50 rounded-lg p-2">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(product.status)}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                  {product.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{product.id}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                <p className="font-medium text-gray-900 dark:text-white">{product.category}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manufacturer</p>
                <p className="font-medium text-gray-900 dark:text-white">{product.manufacturer}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Batch Number</p>
                <p className="font-medium text-gray-900 dark:text-white">{product.batchNumber}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                <p className="font-medium text-gray-900 dark:text-white">{product.location}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manufactured</p>
                <p className="font-medium text-gray-900 dark:text-white">{product.manufacturedDate.toLocaleDateString()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Blockchain Hash</p>
                <p className="text-xs font-mono text-blue-600 dark:text-blue-400 break-all">
                  {product.blockchainHash.substring(0, 20)}...
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleEdit(product)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-800 p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
            </div>
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manufactured</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {products.filter(p => p.status === 'manufactured').length}
              </p>
            </div>
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dispatched</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {products.filter(p => p.status === 'dispatched').length}
              </p>
            </div>
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Installed</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {products.filter(p => p.status === 'installed').length}
              </p>
            </div>
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Maintenance</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {products.filter(p => p.status === 'maintenance').length}
              </p>
            </div>
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Product</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={editingProduct.status}
                  onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="manufactured">Manufactured</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="installed">Installed</option>
                  <option value="inspected">Inspected</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={editingProduct.location || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;