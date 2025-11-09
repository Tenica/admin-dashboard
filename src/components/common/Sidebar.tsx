import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Package,
  Users,
  Truck,
  Map,
  Settings,
  Shield,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isDark }) => {
  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: 'Shipments',
      path: '/shipments',
      icon: <Package className="w-5 h-5" />,
    },
    {
      label: 'Customers',
      path: '/customers',
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: 'Tracking',
      path: '/tracking',
      icon: <Truck className="w-5 h-5" />,
    },
    {
      label: 'Delivery Map',
      path: '/map',
      icon: <Map className="w-5 h-5" />,
    },
    {
      label: 'Admins',
      path: '/admins',
      icon: <Shield className="w-5 h-5" />,
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const sidebarClasses = `
    fixed lg:static inset-y-0 left-0 z-30 w-64
    transition-transform duration-200 ease-in-out
    ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}
    border-r
    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    lg:translate-x-0 overflow-y-auto
  `;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Close button for mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-300">
          <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Navigation
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="px-4 py-6 lg:py-8">
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isDark
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`
                }
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Help section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-300">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <h3 className={`text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-blue-900'}`}>
              Need help?
            </h3>
            <p className={`text-xs mb-3 ${isDark ? 'text-gray-300' : 'text-blue-700'}`}>
              Check our documentation or contact support.
            </p>
            <button className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              Get Help
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
