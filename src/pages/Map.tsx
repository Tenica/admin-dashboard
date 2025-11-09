import React from 'react';
import { MapPin } from 'lucide-react';

interface MapProps {
  isDark: boolean;
}

export const Map: React.FC<MapProps> = ({ isDark }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Delivery Map
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Track active shipments on a map (Integration with Google Maps)
        </p>
      </div>

      <div className={`rounded-lg border p-12 text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} h-96 flex flex-col items-center justify-center`}>
        <MapPin className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
        <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Delivery Map Coming Soon
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Real-time tracking map integration will be available soon.
        </p>
      </div>
    </div>
  );
};
