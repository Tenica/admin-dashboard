import React, { useState } from 'react';
import { LogOut, Menu, X, Moon, Sun, Bell, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onMenuToggle: () => void;
  isDark: boolean;
  onDarkModeToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, isDark, onDarkModeToggle }) => {
  const { admin, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-40`}>
      <div className="px-4 lg:px-6 py-3 lg:py-4">
        <div className="flex justify-between items-center">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              className={`lg:hidden p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold`}>
                AD
              </div>
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Logistics Admin
              </h1>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Dark mode toggle */}
            <button
              onClick={onDarkModeToggle}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4 lg:w-5 lg:h-5" /> : <Moon className="w-4 h-4 lg:w-5 lg:h-5" />}
            </button>

            {/* Notifications */}
            <button
              className={`p-2 rounded-lg transition-colors relative ${
                isDark
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>

            {/* Admin info and logout */}
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-300">
              <div className="text-right hidden md:block">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {admin?.fullName || 'Admin'}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {admin?.email || 'admin@logistics.com'}
                </p>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? 'hover:bg-gray-700 text-red-400'
                      : 'hover:bg-gray-100 text-red-600'
                  }`}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>

                {/* Logout confirmation popup */}
                {showLogoutConfirm && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="p-4">
                      <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Are you sure you want to logout?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowLogoutConfirm(false)}
                          className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                            isDark
                              ? 'bg-gray-600 text-white hover:bg-gray-500'
                              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex-1 px-3 py-2 rounded text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile logout button */}
            <button
              onClick={handleLogout}
              className={`sm:hidden p-2 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-gray-700 text-red-400'
                  : 'hover:bg-gray-100 text-red-600'
              }`}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
