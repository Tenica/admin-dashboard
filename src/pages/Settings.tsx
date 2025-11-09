import React from 'react';
import { Settings as SettingsIcon, Bell, Lock, Palette } from 'lucide-react';

interface SettingsProps {
  isDark: boolean;
}

export const Settings: React.FC<SettingsProps> = ({ isDark }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Settings
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure your dashboard preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notifications Settings */}
        <div className={`rounded-lg border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Bell className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Email notifications
              </span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Shipment updates
              </span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Customer alerts
              </span>
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className={`rounded-lg border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Lock className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Security
            </h2>
          </div>
          <div className="space-y-4">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Change Password
            </button>
            <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors">
              Two-Factor Authentication
            </button>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className={`rounded-lg border p-6 md:col-span-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Palette className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Appearance
            </h2>
          </div>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Dark mode can be toggled from the top navigation bar.
          </p>
        </div>
      </div>
    </div>
  );
};
