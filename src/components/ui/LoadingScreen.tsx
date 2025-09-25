import React from 'react';
import { Train } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-orange-500 border-t-transparent mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Train className="h-12 w-12 text-white animate-pulse" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Indian Railways</h1>
        <p className="text-blue-100 text-lg">Asset Management System</p>
        <div className="mt-4 flex justify-center space-x-2">
          <div className="h-2 w-2 bg-orange-500 rounded-full animate-bounce"></div>
          <div className="h-2 w-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="h-2 w-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;