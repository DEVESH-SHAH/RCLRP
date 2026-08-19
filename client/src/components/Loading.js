import React from 'react';
import { BarChart3 } from 'lucide-react';

const Loading = ({ message = "Loading...", fullScreen = true }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <BarChart3 className="w-8 h-8 text-blue-600 animate-pulse" />
        <div className="absolute inset-0 animate-spin">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full"></div>
        </div>
      </div>
      <p className="text-gray-600 mt-4 text-center">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 ${sizeClasses[size]} ${className}`}></div>
  );
};

export default Loading;
