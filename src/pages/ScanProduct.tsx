import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Camera, Upload, CheckCircle, X, AlertTriangle, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';

interface ScanResult {
  productId: string;
  productName: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  manufacturedDate: string;
  status: string;
  blockchain: string;
  verified: boolean;
}

const ScanProduct: React.FC = () => {
  const { theme } = useTheme();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [stream]);

  // Check camera permission on mount
  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(permissionStatus.state as 'granted' | 'denied' | 'prompt');
      
      permissionStatus.addEventListener('change', () => {
        setCameraPermission(permissionStatus.state as 'granted' | 'denied' | 'prompt');
      });
    } catch (error) {
      console.warn('Permission API not supported');
    }
  };

  const generateScanResult = (rawData: string): ScanResult => {
    // Simulate parsing of QR code data
    const mockData = [
      {
        productId: 'RAIL-JOINT-RJ456',
        productName: 'Heavy Duty Rail Joint',
        category: 'Rail Components',
        manufacturer: 'Steel Works India Ltd.',
        batchNumber: 'BATCH2024-001',
        manufacturedDate: 'January 15, 2024',
        status: 'Installed',
        blockchain: '0x1a2b3c4d5e6f7890abcdef...',
        verified: true
      },
      {
        productId: 'TRACK-BOLT-TB789',
        productName: 'High Tensile Track Bolt',
        category: 'Fasteners',
        manufacturer: 'Bharat Heavy Electricals',
        batchNumber: 'BATCH2024-002',
        manufacturedDate: 'January 10, 2024',
        status: 'In Transit',
        blockchain: '0x9876543210fedcba...',
        verified: true
      },
      {
        productId: 'SIGNAL-BOX-SB321',
        productName: 'Digital Signal Control Box',
        category: 'Signal Equipment',
        manufacturer: 'Railway Electronics Corp.',
        batchNumber: 'BATCH2024-003',
        manufacturedDate: 'December 28, 2023',
        status: 'Maintenance Required',
        blockchain: '0xabcdef123456789...',
        verified: false
      }
    ];

    // Random selection or based on the raw data content
    const selectedData = mockData[Math.floor(Math.random() * mockData.length)];
    return selectedData;
  };

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);
      setShowCamera(true);
      
      // Request camera permission with specific constraints
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: false
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setCameraPermission('granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        
        // Start scanning process after video loads
        videoRef.current.onloadedmetadata = () => {
          startScanningProcess();
        };
      }
      
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      setIsScanning(false);
      setShowCamera(false);
      setCameraPermission('denied');
      
      // Provide specific error messages
      if (error.name === 'NotAllowedError') {
        setError('Camera access denied. Please enable camera permissions in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera device.');
      } else if (error.name === 'NotSupportedError') {
        setError('Camera not supported on this device.');
      } else {
        setError('Unable to access camera. Please try again.');
      }
    }
  };

  const startScanningProcess = () => {
    // Enhanced scanning simulation with multiple stages
    const scanStages = [
      { delay: 1000, message: 'Focusing camera...' },
      { delay: 2000, message: 'Detecting QR code...' },
      { delay: 3500, message: 'Reading data...' },
      { delay: 5000, message: 'Verifying with blockchain...' }
    ];

    scanStages.forEach((stage, index) => {
      setTimeout(() => {
        if (isScanning && showCamera) {
          console.log(stage.message);
        }
      }, stage.delay);
    });

    // Complete scan after all stages
    scanTimeoutRef.current = setTimeout(() => {
      if (isScanning && showCamera) {
        const mockQRData = 'RAIL-PRODUCT-QR-' + Date.now();
        const result = generateScanResult(mockQRData);
        
        stopCamera();
        setScannedData(mockQRData);
        setScanResult(result);
        setIsScanning(false);
      }
    }, 6000);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    setShowCamera(false);
    setIsScanning(false);
    setError(null);
  };

  const handleScan = () => {
    if (cameraPermission === 'denied') {
      setError('Camera permission is required for scanning. Please enable camera access in your browser.');
      return;
    }
    startCamera();
  };

  const handleReset = () => {
    setScannedData(null);
    setScanResult(null);
    setError(null);
    stopCamera();
  };

  const handleManualEntry = () => {
    // Allow manual entry for testing/fallback
    const manualData = prompt('Enter product QR code data (for testing):');
    if (manualData) {
      const result = generateScanResult(manualData);
      setScannedData(manualData);
      setScanResult(result);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Scan Product</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Scan QR codes or barcodes to verify product authenticity
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-800 dark:text-red-200">Scanner Error</span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          {cameraPermission === 'denied' && (
            <div className="mt-2">
              <button
                onClick={checkCameraPermission}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Retry Camera Access
              </button>
            </div>
          )}
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Camera Scanner</h3>
              <button
                onClick={stopCamera}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-gray-900 rounded-lg object-cover"
                autoPlay
                playsInline
                muted
              />
              
              {/* QR Code scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-white border-dashed w-48 h-48 rounded-lg">
                  <div className="relative w-full h-full">
                    {/* Corner markers */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {isScanning ? 'Scanning for QR code...' : 'Position QR code within the frame'}
              </p>
              {isScanning && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex space-x-3">
              <button
                onClick={stopCamera}
                className="flex-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Section */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">QR Code Scanner</h2>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-xl p-8 text-center mb-6">
            {isScanning ? (
              <div className="animate-pulse">
                <div className="relative">
                  <Camera className="h-16 w-16 text-primary-500 mx-auto mb-4" />
                  <div className="absolute -top-2 -right-2">
                    <Zap className="h-6 w-6 text-yellow-500 animate-bounce" />
                  </div>
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Scanning...</p>
                <p className="text-gray-600 dark:text-gray-400">Hold steady while we read the QR code</p>
                <div className="mt-4">
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            ) : scanResult ? (
              <div>
                <div className="relative">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  {scanResult.verified && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-green-500 rounded-full p-1">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {scanResult.verified ? 'Scan Complete!' : 'Product Found (Unverified)'}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {scanResult.verified ? 'Product verified successfully' : 'Product found but verification failed'}
                </p>
              </div>
            ) : (
              <div>
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Ready to Scan</p>
                <p className="text-gray-600 dark:text-gray-400">Position QR code within the camera view</p>
                {cameraPermission === 'denied' && (
                  <p className="text-sm text-red-500 mt-2">Camera access required</p>
                )}
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleScan}
              disabled={isScanning || scanResult !== null}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Camera className="h-5 w-5" />
              <span>{isScanning ? 'Scanning...' : 'Start Scan'}</span>
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-200 dark:bg-dark-600 hover:bg-gray-300 dark:hover:bg-dark-500 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Upload className="h-5 w-5" />
              <span>Reset</span>
            </button>
          </div>
          
          {/* Alternative scanning options */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-600">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Alternative Options:</p>
            <button
              onClick={handleManualEntry}
              className="w-full text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
            >
              Manual QR Code Entry (Testing)
            </button>
          </div>
        </div>

        {/* Product Information */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Product Information</h2>
          
          {scanResult ? (
            <div className="space-y-6">
              <div className={`${scanResult.verified ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'} border rounded-lg p-4`}>
                <div className="flex items-center space-x-2 mb-2">
                  {scanResult.verified ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">Product Verified</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800 dark:text-yellow-200">Verification Failed</span>
                    </>
                  )}
                </div>
                <p className={`text-sm ${scanResult.verified ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
                  {scanResult.verified ? 'Product authenticity and details confirmed' : 'Product found but blockchain verification failed'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product ID</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{scanResult.productId}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{scanResult.productName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{scanResult.category}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Manufacturer</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{scanResult.manufacturer}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Batch Number</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{scanResult.batchNumber}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Manufacturing Date</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{scanResult.manufacturedDate}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    scanResult.status === 'Installed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    scanResult.status === 'In Transit' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    scanResult.status === 'Maintenance Required' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {scanResult.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Blockchain Hash</label>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
                    {scanResult.blockchain}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Scan Record ID</label>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
                    SCAN-{scanResult.productId}-{Date.now().toString().slice(-8)}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Lifecycle History</h3>
                <div className="space-y-3">
                  {(
                    scanResult.productId.includes('RAIL-JOINT') ? [
                      { status: 'Manufactured', date: 'Jan 15, 2024', id: 'MFG-001', verified: true },
                      { status: 'Quality Checked', date: 'Jan 16, 2024', id: 'QC-002', verified: true },
                      { status: 'Dispatched', date: 'Jan 20, 2024', id: 'DIS-003', verified: true },
                      { status: 'Installed', date: 'Jan 25, 2024', id: 'INS-004', verified: scanResult.verified },
                    ] : scanResult.productId.includes('TRACK-BOLT') ? [
                      { status: 'Manufactured', date: 'Jan 10, 2024', id: 'MFG-005', verified: true },
                      { status: 'Quality Checked', date: 'Jan 11, 2024', id: 'QC-006', verified: true },
                      { status: 'In Transit', date: 'Jan 22, 2024', id: 'TRN-007', verified: scanResult.verified },
                    ] : [
                      { status: 'Manufactured', date: 'Dec 28, 2023', id: 'MFG-008', verified: true },
                      { status: 'Quality Checked', date: 'Dec 29, 2023', id: 'QC-009', verified: true },
                      { status: 'Deployed', date: 'Jan 05, 2024', id: 'DEP-010', verified: true },
                      { status: 'Maintenance Required', date: 'Jan 20, 2024', id: 'MAINT-011', verified: false },
                    ]
                  ).map((event, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                      event.verified ? 'bg-gray-50 dark:bg-dark-700' : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          event.verified ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{event.status}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{event.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-500 font-mono">{event.id}</span>
                        {event.verified ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Scan a product QR code to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanProduct;