import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/Toast';
import { useAuth } from './context/AuthContext';

// Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Shipments } from './pages/Shipments';
import { ShipmentDetail } from './pages/ShipmentDetail';
import { Customers } from './pages/Customers';
import { Tracking } from './pages/Tracking';
import { Admins } from './pages/Admins';
import { Settings } from './pages/Settings';
import { Map } from './pages/Map';
import { NotFound } from './pages/NotFound';
import { Loading } from './components/common/Loading';

// Main app content component
const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    // Initialize from localStorage, default to false
    const saved = localStorage.getItem('isDarkMode');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Save isDark preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDark));
  }, [isDark]);

  // Show loading screen while checking authentication state from localStorage
  if (loading) {
    return <Loading isDark={isDark} />;
  }

  // If not authenticated after loading check, show login/signup pages
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Authenticated layout
  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isDark={isDark} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          isDark={isDark}
          onDarkModeToggle={() => setIsDark(!isDark)}
        />

        {/* Pages */}
        <main className={`flex-1 overflow-auto ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className={`px-4 py-6 md:px-6 lg:px-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard isDark={isDark} />} />
              <Route path="/shipments" element={<Shipments isDark={isDark} />} />
              <Route path="/shipments/:id" element={<ShipmentDetail isDark={isDark} />} />
              <Route path="/customers" element={<Customers isDark={isDark} />} />
              <Route path="/tracking" element={<Tracking isDark={isDark} />} />
              <Route path="/admins" element={<Admins isDark={isDark} />} />
              <Route path="/settings" element={<Settings isDark={isDark} />} />
              <Route path="/map" element={<Map isDark={isDark} />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

// Main App component with providers
function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
