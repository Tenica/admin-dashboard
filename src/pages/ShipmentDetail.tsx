import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, CheckCircle, Loader } from 'lucide-react';
import { shipmentService } from '../services/api';
import { Shipment, TrackingEvent } from '../types';
import { Loading } from '../components/common/Loading';
import { useToast } from '../context/ToastContext';

interface ShipmentDetailProps {
  isDark: boolean;
}

const formatDate = (date: any) => {
  if (!date) return 'N/A';
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return 'Invalid Date';
    }
    return parsedDate.toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
};

const formatDateTime = (date: any) => {
  if (!date) return 'N/A';
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return 'Invalid Date';
    }
    return parsedDate.toLocaleString();
  } catch {
    return 'Invalid Date';
  }
};

const getCustomerName = (customer: any) => {
  if (!customer) return 'N/A';
  if (typeof customer === 'object') {
    return customer.fullName || customer.name || customer._id || 'N/A';
  }
  // If customer is just a string ID, we can't display the name
  return 'Loading...';
};

export const ShipmentDetail: React.FC<ShipmentDetailProps> = ({ isDark }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [timeline, setTimeline] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    sendersName: '',
    receiversName: '',
    origin: '',
    destination: '',
    weight: '',
    price: '',
    status: 'pending',
    location: ''
  });

  useEffect(() => {
    if (id) {
      fetchShipment();
    }
  }, [id]);

  const fetchShipment = async () => {
    try {
      setLoading(true);
      // Fetch all shipments and find the one with matching ID
      const response = await shipmentService.getShipments();
      const shipmentData = response.shipments || response.data || response || [];
      const shipments = Array.isArray(shipmentData) ? shipmentData : [];

      const foundShipment = shipments.find((s: Shipment) => s._id === id);

      if (!foundShipment) {
        addToast('Shipment not found', 'error');
        return;
      }

      setShipment(foundShipment);

      // Populate form data
      setFormData({
        sendersName: foundShipment.sendersName || '',
        receiversName: foundShipment.receiversName || '',
        origin: foundShipment.origin || '',
        destination: foundShipment.destination || '',
        weight: foundShipment.weight?.toString() || '',
        price: foundShipment.price?.toString() || '',
        status: foundShipment.status || 'pending',
        location: foundShipment.location || ''
      });

      // Fetch timeline
      await fetchTimeline(id!);
    } catch (error) {
      console.error('Error fetching shipment:', error);
      addToast('Failed to load shipment details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async (shipmentId: string) => {
    try {
      setLoadingTimeline(true);
      const timelineResponse = await shipmentService.getShipmentTimeline(shipmentId);
      console.log('Timeline response:', timelineResponse);
      const timelineData = timelineResponse.timeline || timelineResponse.data?.timeline || [];
      console.log('Timeline data extracted:', timelineData);
      setTimeline(Array.isArray(timelineData) ? timelineData : []);
    } catch (timelineError) {
      console.error('Error fetching timeline:', timelineError);
      addToast('Failed to load shipment timeline', 'error');
      setTimeline([]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const handleDelete = async () => {
    if (!shipment || !window.confirm('Are you sure you want to delete this shipment?')) {
      return;
    }

    try {
      await shipmentService.deleteShipment(shipment._id);
      addToast('Shipment deleted successfully', 'success');
      navigate('/shipments');
    } catch (error) {
      console.error('Error deleting shipment:', error);
      addToast('Failed to delete shipment', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!formData.sendersName || !formData.receiversName || !formData.origin || !formData.destination) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    if (!shipment) return;

    try {
      setSubmitting(true);

      // Build update object, only including fields that have values
      const updateData: any = {
        sendersName: formData.sendersName,
        receiversName: formData.receiversName,
        origin: formData.origin,
        destination: formData.destination,
        status: formData.status
      };

      // Only add optional fields if they have values
      if (formData.weight) {
        updateData.weight = parseFloat(formData.weight);
      }
      if (formData.price) {
        updateData.price = parseFloat(formData.price);
      }
      if (formData.location) {
        updateData.location = formData.location;
      }

      const response = await shipmentService.updateShipment(shipment._id, updateData);

      console.log('Update response:', response);

      // Set initial response data
      const shipmentData = response.shipment || response.data;
      if (shipmentData && typeof shipmentData === 'object' && '_id' in shipmentData) {
        setShipment(shipmentData as Shipment);
      }
      setIsEditing(false);

      // Refetch the full shipment data to ensure all fields (especially customer) are properly populated
      await fetchShipment();

      // Refresh timeline to show any new events created by the update
      await fetchTimeline(shipment._id);

      // Show success message from backend or generic message
      const successMessage = response.message || 'Shipment updated successfully';
      addToast(successMessage, 'success');
    } catch (error: any) {
      console.error('Error updating shipment:', error);
      console.error('Full error object:', error);
      console.error('Error response data:', error.response?.data);

      // Try to extract error message from various possible response structures
      let errorMessage = 'Failed to update shipment';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.log('Final error message:', errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
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

  if (!shipment) {
    return (
      <div className={`flex flex-col items-center justify-center h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <p className={`text-lg mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Shipment not found
        </p>
        <button
          onClick={() => navigate('/shipments')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Shipments
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-2 sm:gap-4">
        <button
          onClick={() => navigate('/shipments')}
          className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Back"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className={`text-2xl sm:text-3xl font-bold break-words ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Shipment {shipment.trackingNumber}
          </h1>
          <p className={`mt-1 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            View and manage shipment details
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Shipment Info Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shipment.status)}`}>
                  {shipment.status}
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Created: {formatDate(shipment.createdAt)}
              </p>
            </div>
            {!isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? 'hover:bg-gray-700 text-blue-400'
                      : 'hover:bg-gray-100 text-blue-600'
                  }`}
                  title="Edit"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? 'hover:bg-gray-700 text-red-400'
                      : 'hover:bg-gray-100 text-red-600'
                  }`}
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Shipment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Customer
              </label>
              <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {getCustomerName(shipment.customer)}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Tracking Number
              </label>
              <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {shipment.trackingNumber}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Sender
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.sendersName}
                  onChange={(e) => setFormData({ ...formData, sendersName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              ) : (
                <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formData.sendersName}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Receiver
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.receiversName}
                  onChange={(e) => setFormData({ ...formData, receiversName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              ) : (
                <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formData.receiversName}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Origin
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              ) : (
                <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formData.origin}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Destination
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              ) : (
                <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formData.destination}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Weight (kg)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              ) : (
                <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formData.weight || 'N/A'}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Price ($)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              ) : (
                <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${formData.price || '0.00'}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Status
              </label>
              {isEditing ? (
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              ) : (
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.status)}`}>
                    {formData.status}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Current Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="e.g., New York Port"
                />
              ) : (
                <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formData.location || 'Not specified'}
                </p>
              )}
            </div>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex gap-2 pt-4 border-t border-gray-300">
              <button
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data to original values
                  setFormData({
                    sendersName: shipment.sendersName || '',
                    receiversName: shipment.receiversName || '',
                    origin: shipment.origin || '',
                    destination: shipment.destination || '',
                    weight: shipment.weight?.toString() || '',
                    price: shipment.price?.toString() || '',
                    status: shipment.status || 'pending',
                    location: shipment.location || ''
                  });
                }}
                disabled={submitting}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Section */}
      <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-4 sm:p-6">
          <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Shipment Timeline
          </h2>

          {loadingTimeline ? (
            <div className="flex justify-center py-8">
              <Loader className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 animate-spin" />
            </div>
          ) : timeline && timeline.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {timeline.map((event: any, index: number) => (
                <div key={index} className="flex gap-2 sm:gap-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-600 rounded-full p-2">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 h-20 bg-gray-300 mt-2"></div>
                    )}
                  </div>
                  <div className={`flex-1 pt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <p className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {event.status || event.type || 'Update'}
                    </p>
                    {event.note && (
                      <p className="text-sm mt-1">{event.note}</p>
                    )}
                    <p className="text-xs mt-2 opacity-75">
                      {formatDateTime(event.timestamp || event.updatedAt || event.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No timeline events available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
