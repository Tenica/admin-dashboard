import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Users, Truck, TrendingUp } from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { Loading } from '../components/common/Loading';
import { shipmentService, customerService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Shipment, Customer } from '../types';

interface DashboardStats {
  totalShipments: number;
  activeDeliveries: number;
  completedShipments: number;
  totalCustomers: number;
}

interface DashboardProps {
  isDark: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ isDark }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalShipments: 0,
    activeDeliveries: 0,
    completedShipments: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch shipments
        const shipmentsRes = await shipmentService.getShipments();
        const shipmentsData = shipmentsRes.shipments || [];
        setShipments(shipmentsData.slice(0, 5)); // Show latest 5

        // Calculate stats
        const totalShipments = shipmentsData.length;
        const activeDeliveries = shipmentsData.filter(
          (s) => s.status === 'in-transit' || s.status === 'assigned'
        ).length;
        const completedShipments = shipmentsData.filter(
          (s) => s.status === 'delivered'
        ).length;

        // Fetch customers count
        const customersRes = await customerService.getCustomers();
        const customersData = customersRes.customers || [];
        const totalCustomers = customersData.length;

        setStats({
          totalShipments,
          activeDeliveries,
          completedShipments,
          totalCustomers,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        addToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [addToast]);

  if (loading) {
    return <Loading isDark={isDark} />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in-transit':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Dashboard
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Welcome back! Here's your logistics overview.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Shipments"
          value={stats.totalShipments}
          icon={<Package className="w-6 h-6" />}
          color="blue"
          isDark={isDark}
          trend={{ value: 12, direction: 'up' }}
        />
        <StatCard
          title="Active Deliveries"
          value={stats.activeDeliveries}
          icon={<Truck className="w-6 h-6" />}
          color="green"
          isDark={isDark}
          trend={{ value: 8, direction: 'up' }}
        />
        <StatCard
          title="Completed"
          value={stats.completedShipments}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isDark={isDark}
          trend={{ value: 5, direction: 'down' }}
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={<Users className="w-6 h-6" />}
          color="yellow"
          isDark={isDark}
          trend={{ value: 3, direction: 'up' }}
        />
      </div>

      {/* Recent Shipments */}
      <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Recent Shipments
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Tracking #
                </th>
                <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Origin
                </th>
                <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Destination
                </th>
                <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {shipments.length > 0 ? (
                shipments.map((shipment) => (
                  <tr
                    key={shipment._id}
                    onClick={() => navigate(`/shipments/${shipment._id}`)}
                    className={`border-b cursor-pointer transition-colors ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <td className={`px-6 py-4 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {shipment.trackingNumber}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {shipment.origin}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {shipment.destination}
                    </td>
                    <td className={`px-6 py-4 text-sm`}>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {new Date(shipment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className={`px-6 py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    No shipments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
