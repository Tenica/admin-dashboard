import React, { useState } from 'react';
import { Search, Loader } from 'lucide-react';
import { shipmentService } from '../services/api';
import { Shipment, TrackingEvent } from '../types';
import { useToast } from '../context/ToastContext';

interface TrackingProps {
  isDark: boolean;
}

export const Tracking: React.FC<TrackingProps> = ({ isDark }) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [timeline, setTimeline] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { addToast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);

    if (!trackingNumber.trim()) {
      addToast('Please enter a tracking number', 'warning');
      return;
    }

    try {
      setLoading(true);
      const response = await shipmentService.trackShipment(trackingNumber);

      if (response.success && response.shipment) {
        setShipment(response.shipment);

        // Mock timeline data based on history
        const mockTimeline: TrackingEvent[] = (response.shipment as any)?.history?.map(
          (h: any, idx: number) => ({
            _id: `${idx}`,
            shipment: response.shipment!._id,
            status: h.status,
            location: h.note || h.status,
            timestamp: h.updatedAt || new Date().toISOString(),
          })
        ) || [];

        setTimeline(mockTimeline);
      } else {
        setShipment(null);
        setTimeline([]);
        addToast('Shipment not found', 'error');
      }
    } catch (error) {
      console.error('Error tracking shipment:', error);
      setShipment(null);
      setTimeline([]);
      addToast('Failed to track shipment', 'error');
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Track Shipment
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Enter tracking number to view real-time shipment status
        </p>
      </div>

      {/* Search form */}
      <div className={`rounded-lg border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
              placeholder="Enter tracking number (e.g., TRK123456)"
              className={`w-full px-4 py-3 rounded-lg border outline-none transition ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:ring-2 focus:ring-blue-600 focus:border-transparent`}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && !loading && (
        <>
          {shipment ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Shipment details */}
              <div className={`rounded-lg border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Shipment Details
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Tracking Number
                    </p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {shipment.trackingNumber}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Status
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Origin
                    </p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {shipment.origin}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Destination
                    </p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {shipment.destination}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Sender
                    </p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {shipment.sendersName}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Receiver
                    </p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {shipment.receiversName}
                    </p>
                  </div>
                  {shipment.weight && (
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Weight
                      </p>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {shipment.weight} kg
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className={`lg:col-span-2 rounded-lg border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Tracking Timeline
                </h2>
                <div className="space-y-4">
                  {timeline.length > 0 ? (
                    timeline.map((event, idx) => (
                      <div key={event._id} className="flex gap-4">
                        <div className="relative flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full ${event.status === shipment.status ? 'bg-blue-600' : 'bg-gray-400'}`} />
                          {idx < timeline.length - 1 && (
                            <div className={`w-0.5 h-12 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {event.status}
                          </p>
                          {event.location && (
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {event.location}
                            </p>
                          )}
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      No timeline events available
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`rounded-lg border p-12 text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <p className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                No shipment found
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Please check the tracking number and try again
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
