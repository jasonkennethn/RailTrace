import React, { useState } from 'react';
import { QrCode, Camera, Upload, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';

const ScanProduct: React.FC = () => {
  const { theme } = useTheme();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    // Simulate QR code scan
    setTimeout(() => {
      setScannedData('RAIL-JOINT-RJ456-BATCH2024-HASH0x123abc');
      setIsScanning(false);
    }, 2000);
  };

  const handleReset = () => {
    setScannedData(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Scan Product</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Scan QR codes or barcodes to verify products on the blockchain
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Section */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">QR Code Scanner</h2>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-xl p-8 text-center mb-6">
            {isScanning ? (
              <div className="animate-pulse">
                <Camera className="h-16 w-16 text-primary-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Scanning...</p>
                <p className="text-gray-600 dark:text-gray-400">Hold steady while we read the QR code</p>
              </div>
            ) : scannedData ? (
              <div>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Scan Complete!</p>
                <p className="text-gray-600 dark:text-gray-400">Product verified on blockchain</p>
              </div>
            ) : (
              <div>
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Ready to Scan</p>
                <p className="text-gray-600 dark:text-gray-400">Position QR code within the camera view</p>
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleScan}
              disabled={isScanning || scannedData !== null}
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
        </div>

        {/* Product Information */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Product Information</h2>
          
          {scannedData ? (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">Blockchain Verified</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Product authenticity confirmed on Ethereum blockchain
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product ID</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">RAIL-JOINT-RJ456</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                  <p className="mt-1 text-gray-900 dark:text-white">Rail Joint</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Manufacturer</label>
                  <p className="mt-1 text-gray-900 dark:text-white">Steel Works India Ltd.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Batch Number</label>
                  <p className="mt-1 text-gray-900 dark:text-white">BATCH2024</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Manufacturing Date</label>
                  <p className="mt-1 text-gray-900 dark:text-white">January 15, 2024</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Status</label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Installed
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Blockchain Hash</label>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
                    0x123abc456def789ghi012jkl345mno678pqr901stu234vwx567yza890bcd
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Lifecycle History</h3>
                <div className="space-y-3">
                  {[
                    { status: 'Manufactured', date: 'Jan 15, 2024', hash: '0x123...abc' },
                    { status: 'Quality Checked', date: 'Jan 16, 2024', hash: '0x456...def' },
                    { status: 'Dispatched', date: 'Jan 20, 2024', hash: '0x789...ghi' },
                    { status: 'Installed', date: 'Jan 25, 2024', hash: '0x012...jkl' },
                  ].map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{event.status}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{event.date}</p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-500 font-mono">{event.hash}</span>
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