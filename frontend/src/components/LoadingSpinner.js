import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-800 border-t-primary-500 animate-spin"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;

