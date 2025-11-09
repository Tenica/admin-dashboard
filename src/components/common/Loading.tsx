import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingProps {
  fullScreen?: boolean;
  isDark?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ fullScreen = false, isDark = false }) => {
  if (fullScreen) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Loader className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );
};
