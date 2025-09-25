import React, { useState, useEffect } from 'react';
import { Package, Edit, Save, X, QrCode, Calendar, MapPin, Factory, Barcode } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';

interface ProductDetail {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  qrCode: string;
  barcode: string;
  manufacturedDate: Date;
  specifications: {
    material: string;
    dimensions: string;
    weight: string;
    grade: string;
    standard: string;
  };
  status: 'manufactured' | 'dispatched' | 'installed' | 'inspected' | 'maintenance';
  location?: string;
  description: string;
  certifications: string[];
  testReports: string[];
}

const ProductDetails: React.FC = () => {
  const { theme } = useTheme();
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Mock product details data
      const mockProducts: ProductDetail[] = [
        {
          id: 'RAIL-JOINT-RJ456',
          name: 'Heavy Duty Rail Joint',
          category: 'Rail Components',
          manufacturer: 'Steel Works India Ltd.',
          batchNumber: 'BATCH2024-001',
          qrCode: 'QR-RJ456-2024',
          barcode: '1234567890123',
          manufacturedDate: new Date('2024-01-15'),
          specifications: {
            material: 'High Carbon Steel',
            dimensions: '150mm x 100mm x 25mm',
            weight: '12.5 kg',
            grade: 'Grade A',
            standard: 'IS 2062:2011'
          },
          status: 'installed',
          location: 'Track Section A-123, Mumbai Division',
          description: 'Heavy-duty rail joint designed for high-traffic railway sections. Manufactured using premium grade steel with enhanced durability and corrosion resistance.',
          certifications: ['ISO 9001:2015', 'RDSO Approval', 'BIS Certification'],
          testReports: ['Tensile Test Report', 'Impact Test Report', 'Chemical Analysis Report']
        },
        {
          id: 'SIGNAL-BOX-SB789',
          name: 'Digital Signal Control Box',
          category: 'Signaling Equipment',
          manufacturer: 'Railway Electronics Corp.',
          batchNumber: 'BATCH2024-002',
          qrCode: 'QR-SB789-2024',
          barcode: '2345678901234',
          manufacturedDate: new Date('2024-01-10'),
          specifications: {
            material: 'Aluminum Alloy Housing',
            dimensions: '300mm x 200mm x 150mm',
            weight: '8.2 kg',
            grade: 'IP65 Rated',
            standard: 'IEC 61508'
          },
          status: 'maintenance',
          location: 'Signal Post SP-45, Delhi Division',
          description: 'Advanced digital signal control box with microprocessor-based control system. Features remote monitoring capabilities and fail-safe operation.',
          certifications: ['CE Marking', 'RDSO Approval', 'FCC Certification'],
          testReports: ['EMC Test Report', 'Environmental Test Report', 'Functional Test Report']
        },
        {
          id: 'TRACK-BOLT-TB321',
          name: 'High Tensile Track Bolt',
          category: 'Fastening Systems',
          manufacturer: 'Precision Fasteners Ltd.',
          batchNumber: 'BATCH2024-003',
          qrCode: 'QR-TB321-2024',
          barcode: '3456789012345',
          manufacturedDate: new Date('2024-01-12'),
          specifications: {
            material: 'Alloy Steel',
            dimensions: 'M24 x 120mm',
            weight: '0.8 kg',
            grade: '8.8 Grade',
            standard: 'IS 1367:2002'
          },
          status: 'dispatched',
          location: 'In Transit to Chennai Division',
          description: 'High-strength track bolts manufactured from premium alloy steel. Designed for secure fastening of rail components with superior corrosion resistance.',
          certifications: ['IS Certification', 'RDSO Approval'],
          testReports: ['Proof Load Test', 'Hardness Test Report', 'Coating Thickness Report']
        }
      ];

      setProducts(mockProducts);
      if (mockProducts.length > 0) {
        setSelectedProduct(mockProducts[0]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: ProductDetail) => {
    setEditingProduct({ ...product });
  };

  const handleSave = () => {
    if (editingProduct) {
      setProducts(products.map(p => 
        p.id === editingProduct.id ? editingProduct : p
      ));
      if (selectedProduct?.id === editingProduct.id) {
        setSelectedProduct(editingProduct);
      }
      setEditingProduct(null);
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'manufactured':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'dispatched':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'installed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inspected':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'maintenance':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Product Details
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage product codes, manufacturing info, specifications, and batch numbers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Product List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 shadow-sm">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={clsx(
                    'w-full text-left p-3 rounded-lg transition-colors',
                    selectedProduct?.id === product.id
                      ? 'bg-primary-100 dark:bg-primary-900 border border-primary-300 dark:border-primary-700'
                      : 'hover:bg-gray-50 dark:hover:bg-dark-700'
                  )}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Package className="h-4 w-4 text-primary-600" />
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{product.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{product.id}</p>
                  <span className={clsx(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1',
                    getStatusColor(product.status)
                  )}>
                    {product.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="lg:col-span-3">
          {selectedProduct && (
            <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedProduct.name}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className={clsx(
                    'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                    getStatusColor(selectedProduct.status)
                  )}>
                    {selectedProduct.status.toUpperCase()}
                  </span>
                  <button
                    onClick={() => handleEdit(selectedProduct)}
                    className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product ID</label>
                    <p className="text-gray-900 dark:text-white font-mono">{selectedProduct.id}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <p className="text-gray-900 dark:text-white">{selectedProduct.category}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manufacturer</label>
                    <div className="flex items-center space-x-2">
                      <Factory className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">{selectedProduct.manufacturer}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch Number</label>
                    <p className="text-gray-900 dark:text-white font-mono">{selectedProduct.batchNumber}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manufactured Date</label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">{selectedProduct.manufacturedDate.toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">{selectedProduct.location}</p>
                    </div>
                  </div>
                </div>

                {/* Codes and Identification */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Codes & Identification</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">QR Code</label>
                    <div className="flex items-center space-x-2">
                      <QrCode className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white font-mono">{selectedProduct.qrCode}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Barcode</label>
                    <div className="flex items-center space-x-2">
                      <Barcode className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white font-mono">{selectedProduct.barcode}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Certifications</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Material</label>
                    <p className="text-gray-900 dark:text-white">{selectedProduct.specifications.material}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dimensions</label>
                    <p className="text-gray-900 dark:text-white">{selectedProduct.specifications.dimensions}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight</label>
                    <p className="text-gray-900 dark:text-white">{selectedProduct.specifications.weight}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grade</label>
                    <p className="text-gray-900 dark:text-white">{selectedProduct.specifications.grade}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Standard</label>
                    <p className="text-gray-900 dark:text-white">{selectedProduct.specifications.standard}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-white">{selectedProduct.description}</p>
                </div>
              </div>

              {/* Test Reports */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Test Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedProduct.testReports.map((report, index) => (
                    <div key={index} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-blue-800 dark:text-blue-200 font-medium">{report}</p>
                      <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-1">
                        View Report
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Product Details
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                >
                  <option value="Rail Components">Rail Components</option>
                  <option value="Signaling Equipment">Signaling Equipment</option>
                  <option value="Fastening Systems">Fastening Systems</option>
                  <option value="Track Components">Track Components</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={editingProduct.status}
                  onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 dark:bg-dark-600 hover:bg-gray-400 dark:hover:bg-dark-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
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

export default ProductDetails;