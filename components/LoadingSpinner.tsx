
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Analyzing your process...</p>
    </div>
  );
};

export default LoadingSpinner;
