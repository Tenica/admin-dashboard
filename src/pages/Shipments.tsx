import React, { useEffect, useState } from 'react';
import { Trash2, Eye, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { shipmentService } from '../services/api';
import { Shipment } from '../types';
import { Loading } from '../components/common/Loading';
import { useToast } from '../context/ToastContext';

interface ShipmentsProps {
  isDark: boolean;
}

export const Shipments: React.FC<ShipmentsProps> = ({ isDark }) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    // Filter shipments based on search term
    const filtered = shipments.filter((s) =>
      s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredShipments(filtered);
  }, [searchTerm, shipments]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await shipmentService.getShipments();
      console.log('Shipments response:', response);
      // Handle different response structures
      const shipmentData = response.shipments || response.data || response || [];
      setShipments(Array.isArray(shipmentData) ? shipmentData : []);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      addToast('Failed to load shipments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      try {
        await shipmentService.deleteShipment(id);
        setShipments(shipments.filter((s) => s._id !== id));
        addToast('Shipment deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting shipment:', error);
        addToast('Failed to delete shipment', 'error');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in-transit':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <Loading isDark={isDark} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Shipments
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage all shipments and deliveries
        </p>
      </div>

      {/* Search bar */}
      <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-300">
          <Search className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search by tracking number, origin, or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`flex-1 outline-none ${isDark ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
          />
        </div>
      </div>

      {/* Shipments Table - Desktop */}
      <div className="hidden md:block">
        <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Tracking #
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Customer
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Route
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Status
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Date
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.length > 0 ? (
                  filteredShipments.map((shipment) => (
                    <tr
                      key={shipment._id}
                      className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <td className={`px-4 py-4 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {shipment.trackingNumber}
                      </td>
                      <td className={`px-4 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {shipment.customer && typeof shipment.customer === 'object'
                          ? shipment.customer.fullName || shipment.customer.name || 'N/A'
                          : 'N/A'}
                      </td>
                      <td className={`px-4 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {shipment.origin} → {shipment.destination}
                      </td>
                      <td className={`px-4 py-4 text-sm`}>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                          {shipment.status}
                        </span>
                      </td>
                      <td className={`px-4 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {new Date(shipment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/shipments/${shipment._id}`)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? 'hover:bg-gray-600 text-gray-300'
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(shipment._id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? 'hover:bg-gray-600 text-red-400'
                                : 'hover:bg-gray-100 text-red-600'
                            }`}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className={`px-4 py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {searchTerm ? 'No shipments found matching your search' : 'No shipments found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Shipments Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {filteredShipments.length > 0 ? (
          filteredShipments.map((shipment) => (
            <div
              key={shipment._id}
              className={`rounded-lg border p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Tracking #
                    </p>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {shipment.trackingNumber}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(shipment.status)}`}>
                    {shipment.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Customer
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {shipment.customer && typeof shipment.customer === 'object'
                        ? shipment.customer.fullName || shipment.customer.name || 'N/A'
                        : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Date
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {new Date(shipment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Route
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {shipment.origin} → {shipment.destination}
                  </p>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-300">
                  <button
                    onClick={() => navigate(`/shipments/${shipment._id}`)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDelete(shipment._id)}
                    className={`py-2 px-3 rounded-lg transition-colors ${
                      isDark
                        ? 'bg-gray-700 text-red-400 hover:bg-gray-600'
                        : 'bg-gray-100 text-red-600 hover:bg-gray-200'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className={`rounded-lg border p-8 text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm ? 'No shipments found matching your search' : 'No shipments found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
