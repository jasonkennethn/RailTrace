import React, { useEffect, useState } from 'react';

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="text-center">
        <div className="relative mb-8">
          <div className="animate-pulse">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8C9f-iGUubXb8jnwt3zoVJRhWxOMFeLUURQ&s" 
              alt="Indian Railways Logo" 
              className="h-32 w-32 mx-auto mb-6 rounded-full bg-white p-4 shadow-2xl"
            />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in">Indian Railways</h1>
        <p className="text-blue-100 text-xl mb-8 animate-fade-in-delay">Asset Management System</p>
        <div className="flex justify-center space-x-2">
          <div className="h-3 w-3 bg-orange-500 rounded-full animate-bounce"></div>
          <div className="h-3 w-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="h-3 w-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;