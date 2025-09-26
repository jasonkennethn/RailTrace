import React, { useState } from 'react';
import { FileText, Camera, MapPin, Save, CheckCircle, AlertTriangle, Upload, QrCode } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';

interface InspectionRecord {
  productId: string;
  productName: string;
  section: string;
  inspectionType: 'routine' | 'emergency' | 'maintenance' | 'quality';
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  defects: string[];
  maintenancePerformed: string[];
  findings: string;
  recommendations: string;
  images: File[];
  nextInspectionDate: Date;
  priority: 'low' | 'medium' | 'high';
}

const RecordInspection: React.FC = () => {
  const { theme } = useTheme();
  const [inspectionData, setInspectionData] = useState<InspectionRecord>({
    productId: '',
    productName: '',
    section: '',
    inspectionType: 'routine',
    condition: 'good',
    defects: [],
    maintenancePerformed: [],
    findings: '',
    recommendations: '',
    images: [],
    nextInspectionDate: new Date(),
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const defectOptions = [
    'Cracks',
    'Corrosion',
    'Wear',
    'Loose bolts',
    'Misalignment',
    'Deformation',
    'Surface damage',
    'Joint separation',
    'Fastener failure',
    'Electrical issues'
  ];

  const maintenanceOptions = [
    'Cleaning',
    'Lubrication',
    'Bolt tightening',
    'Replacement',
    'Adjustment',
    'Calibration',
    'Painting',
    'Welding repair',
    'Electrical repair',
    'Preventive maintenance'
  ];

  const handleDefectChange = (defect: string, checked: boolean) => {
    if (checked) {
      setInspectionData({
        ...inspectionData,
        defects: [...inspectionData.defects, defect]
      });
    } else {
      setInspectionData({
        ...inspectionData,
        defects: inspectionData.defects.filter(d => d !== defect)
      });
    }
  };

  const handleMaintenanceChange = (maintenance: string, checked: boolean) => {
    if (checked) {
      setInspectionData({
        ...inspectionData,
        maintenancePerformed: [...inspectionData.maintenancePerformed, maintenance]
      });
    } else {
      setInspectionData({
        ...inspectionData,
        maintenancePerformed: inspectionData.maintenancePerformed.filter(m => m !== maintenance)
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setInspectionData({
      ...inspectionData,
      images: [...inspectionData.images, ...files]
    });
  };

  const removeImage = (index: number) => {
    setInspectionData({
      ...inspectionData,
      images: inspectionData.images.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!inspectionData.productId || !inspectionData.productName || !inspectionData.section) {
      alert('Please fill in all required fields.');
      return;
    }
    
    // Validate photo upload requirement
    if (inspectionData.images.length === 0) {
      alert('At least one inspection photo must be uploaded before submitting the record.');
      return;
    }
    
    // Validate findings field
    if (!inspectionData.findings.trim()) {
      alert('Please provide detailed inspection findings.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Simulate database recording
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Inspection recorded:', {
        ...inspectionData,
        timestamp: new Date(),
        inspectorId: 'current_user_id'
      });

      setShowSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setShowSuccess(false);
        setInspectionData({
          ...inspectionData,
          productId: '',
          productName: '',
          section: '',
          findings: '',
          recommendations: '',
          images: [],
          nextInspectionDate: new Date(),
        });
      }, 3000);

    } catch (error) {
      console.error('Error recording inspection:', error);
      alert('Failed to record inspection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scanProduct = () => {
    // Simulate QR code scan
    const mockProducts = [
      { id: 'RAIL-JOINT-RJ456', name: 'Heavy Duty Rail Joint' },
      { id: 'SIGNAL-BOX-SB789', name: 'Digital Signal Control Box' },
      { id: 'TRACK-BOLT-TB321', name: 'High Tensile Track Bolt' }
    ];
    
    const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
    setInspectionData({
      ...inspectionData,
      productId: randomProduct.id,
      productName: randomProduct.name
    });
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

  if (showSuccess) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-8 shadow-sm text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Inspection Recorded Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your inspection has been recorded successfully and is now saved in the system.
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">Successfully Recorded</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Record ID: INS-{Date.now().toString().slice(-8)}
            </p>
          </div>

          <button
            onClick={() => setShowSuccess(false)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Record Another Inspection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Record Inspection
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter track condition, defects, and maintenance details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Information */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product ID</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inspectionData.productId}
                  onChange={(e) => setInspectionData({ ...inspectionData, productId: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  placeholder="Enter or scan product ID"
                  required
                />
                <button
                  type="button"
                  onClick={scanProduct}
                  className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-colors"
                >
                  <QrCode className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
              <input
                type="text"
                value={inspectionData.productName}
                onChange={(e) => setInspectionData({ ...inspectionData, productName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                placeholder="Product name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Section</label>
              <div className="relative">
                <MapPin className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={inspectionData.section}
                  onChange={(e) => setInspectionData({ ...inspectionData, section: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Section A-123"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Inspection Type</label>
              <select
                value={inspectionData.inspectionType}
                onChange={(e) => setInspectionData({ ...inspectionData, inspectionType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              >
                <option value="routine">Routine</option>
                <option value="emergency">Emergency</option>
                <option value="maintenance">Maintenance</option>
                <option value="quality">Quality</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
              <select
                value={inspectionData.priority}
                onChange={(e) => setInspectionData({ ...inspectionData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Condition Assessment */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Condition Assessment</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Overall Condition</label>
            <div className="flex flex-wrap gap-2">
              {['excellent', 'good', 'fair', 'poor', 'critical'].map((condition) => (
                <button
                  key={condition}
                  type="button"
                  onClick={() => setInspectionData({ ...inspectionData, condition: condition as any })}
                  className={clsx(
                    'px-4 py-2 rounded-lg font-medium transition-colors capitalize',
                    inspectionData.condition === condition
                      ? getConditionColor(condition)
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                  )}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Defects Identified</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {defectOptions.map((defect) => (
                  <label key={defect} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={inspectionData.defects.includes(defect)}
                      onChange={(e) => handleDefectChange(defect, e.target.checked)}
                      className="rounded border-gray-300 dark:border-dark-600 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{defect}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Maintenance Performed</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {maintenanceOptions.map((maintenance) => (
                  <label key={maintenance} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={inspectionData.maintenancePerformed.includes(maintenance)}
                      onChange={(e) => handleMaintenanceChange(maintenance, e.target.checked)}
                      className="rounded border-gray-300 dark:border-dark-600 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{maintenance}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Findings */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detailed Findings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Inspection Findings</label>
              <textarea
                value={inspectionData.findings}
                onChange={(e) => setInspectionData({ ...inspectionData, findings: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                placeholder="Describe your detailed findings..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations</label>
              <textarea
                value={inspectionData.recommendations}
                onChange={(e) => setInspectionData({ ...inspectionData, recommendations: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                placeholder="Provide recommendations for future actions..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Next Inspection Date</label>
              <input
                type="date"
                value={inspectionData.nextInspectionDate.toISOString().split('T')[0]}
                onChange={(e) => setInspectionData({ ...inspectionData, nextInspectionDate: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Inspection Images <span className="text-red-500">*</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Images <span className="text-sm text-red-500">(Required - At least 1 photo)</span>
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                inspectionData.images.length === 0 
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' 
                  : 'border-gray-300 dark:border-dark-600'
              }`}>
                <Camera className={`h-12 w-12 mx-auto mb-4 ${
                  inspectionData.images.length === 0 ? 'text-red-400' : 'text-gray-400'
                }`} />
                <p className={`mb-2 ${
                  inspectionData.images.length === 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {inspectionData.images.length === 0 
                    ? 'Please upload at least one inspection photo' 
                    : 'Click to upload or drag and drop'
                  }
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors inline-flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Choose Files</span>
                </label>
              </div>
            </div>

            {inspectionData.images.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Uploaded Images ({inspectionData.images.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {inspectionData.images.map((image, index) => (
                    <div key={index} className="relative bg-gray-100 dark:bg-dark-700 rounded-lg p-4">
                      <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-600 dark:text-gray-400 text-center truncate">
                        {image.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6 shadow-sm">
          <div className="space-y-4">
            {/* Validation Summary */}
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Pre-submission Checklist:</h4>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {inspectionData.productId && inspectionData.productName && inspectionData.section ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${
                      inspectionData.productId && inspectionData.productName && inspectionData.section
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      Product information completed
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {inspectionData.findings.trim() ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${
                      inspectionData.findings.trim()
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      Inspection findings provided
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {inspectionData.images.length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${
                      inspectionData.images.length > 0
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      At least one photo uploaded ({inspectionData.images.length} photos)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  This inspection will be recorded securely in the system
                </span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Recording Inspection...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Record Inspection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RecordInspection;