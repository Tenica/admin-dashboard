import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, Search, Truck, RotateCcw, Trash } from 'lucide-react';
import { customerService, shipmentService } from '../services/api';
import { Customer } from '../types';
import { Loading } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

interface CustomersProps {
  isDark: boolean;
}

export const Customers: React.FC<CustomersProps> = ({ isDark }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [deletedCustomers, setDeletedCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeletedCustomers, setShowDeletedCustomers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    country: ''
  });
  const [shipmentData, setShipmentData] = useState({
    sendersName: '',
    receiversName: '',
    origin: '',
    destination: '',
    weight: '',
    price: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    // Filter customers based on search term
    const filtered = customers.filter((c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getCustomers();
      console.log('Customers response:', response);
      // Handle different response structures
      const customerData = response.customers || response.data || response || [];
      setCustomers(Array.isArray(customerData) ? customerData : []);

      // Fetch deleted customers
      try {
        const deletedResponse = await customerService.getDeletedCustomers();
        const deletedData = deletedResponse.customers || deletedResponse.data || [];
        setDeletedCustomers(Array.isArray(deletedData) ? deletedData : []);
      } catch (error) {
        console.error('Error fetching deleted customers:', error);
        // Don't show error toast for this, it's not critical
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      addToast('Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        setSubmitting(true);
        console.log('Attempting to delete customer with ID:', id);
        await customerService.deleteCustomer(id);
        addToast('Customer deleted successfully', 'success');
        // Refresh the entire customer list
        await fetchCustomers();
      } catch (error: any) {
        console.error('Error deleting customer:', error);
        const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to delete customer';
        addToast(errorMessage, 'error');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleRestoreCustomer = async (id: string) => {
    try {
      setSubmitting(true);
      console.log('Attempting to restore customer with ID:', id);
      await customerService.restoreCustomer(id);
      addToast('Customer restored successfully', 'success');
      // Refresh all customers to update both lists
      await fetchCustomers();
    } catch (error: any) {
      console.error('Error restoring customer:', error);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to restore customer';
      addToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePermanentlyDeleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this customer? This action cannot be undone.')) {
      try {
        await customerService.deleteCustomer(id);
        setDeletedCustomers(deletedCustomers.filter((c) => c._id !== id));
        addToast('Customer permanently deleted', 'success');
      } catch (error) {
        console.error('Error permanently deleting customer:', error);
        addToast('Failed to permanently delete customer', 'error');
      }
    }
  };

  const handleOpenModal = async (mode: 'view' | 'edit' | 'create', customer?: Customer) => {
    setModalMode(mode);
    if (mode === 'create') {
      setSelectedCustomer(null);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        address: '',
        country: ''
      });
      setShowModal(true);
    } else if (customer) {
      try {
        // Fetch full customer details for view/edit mode
        const response = await customerService.getCustomerById(customer._id);
        const fullCustomer = response.customer || response.data || customer;
        setSelectedCustomer(fullCustomer);
        setFormData({
          fullName: fullCustomer.fullName,
          email: fullCustomer.email,
          phone: fullCustomer.phone,
          city: fullCustomer.city,
          address: fullCustomer.address,
          country: fullCustomer.country
        });
        setShowModal(true);
      } catch (error) {
        console.error('Error fetching customer details:', error);
        addToast('Failed to load customer details', 'error');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (modalMode === 'create') {
        const response = await customerService.createCustomer(formData);
        setCustomers([...customers, response.customer]);
        addToast('Customer created successfully', 'success');
      } else if (modalMode === 'edit' && selectedCustomer) {
        const response = await customerService.updateCustomer(selectedCustomer._id, formData);
        setCustomers(customers.map((c) => (c._id === selectedCustomer._id ? response.customer : c)));
        addToast('Customer updated successfully', 'success');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving customer:', error);
      addToast(`Failed to ${modalMode === 'create' ? 'create' : 'update'} customer`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateShipment = async () => {
    if (!shipmentData.sendersName || !shipmentData.receiversName || !shipmentData.origin || !shipmentData.destination) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    if (!selectedCustomer) {
      addToast('No customer selected', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const response = await shipmentService.createShipment({
        customer: selectedCustomer._id,
        sendersName: shipmentData.sendersName,
        receiversName: shipmentData.receiversName,
        origin: shipmentData.origin,
        destination: shipmentData.destination,
        weight: shipmentData.weight ? parseFloat(shipmentData.weight) : undefined,
        price: shipmentData.price ? parseFloat(shipmentData.price) : undefined,
        status: 'pending'
      });
      console.log('Shipment created successfully:', response);
      addToast('Shipment created successfully', 'success');
      setShowShipmentModal(false);
      setShipmentData({
        sendersName: '',
        receiversName: '',
        origin: '',
        destination: '',
        weight: '',
        price: ''
      });
    } catch (error: any) {
      console.error('Error creating shipment:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to create shipment';
      addToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenShipmentModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShipmentData({
      sendersName: '',
      receiversName: '',
      origin: '',
      destination: '',
      weight: '',
      price: ''
    });
    setShowShipmentModal(true);
  };

  if (loading) {
    return <Loading isDark={isDark} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Customers
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your customer database
          </p>
        </div>
        <button
          onClick={() => handleOpenModal('create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Customer
        </button>
      </div>

      {/* Search bar */}
      <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-300">
          <Search className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`flex-1 outline-none ${isDark ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Name
                </th>
                <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Email
                </th>
                <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Phone
                </th>
                <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  City
                </th>
                <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Joined
                </th>
                <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer._id}
                    className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <td className={`px-6 py-4 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {customer.fullName}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {customer.email}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {customer.phone}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {customer.city}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal('view', customer)}
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
                          onClick={() => handleOpenModal('edit', customer)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark
                              ? 'hover:bg-gray-600 text-blue-400'
                              : 'hover:bg-gray-100 text-blue-600'
                          }`}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark
                              ? 'hover:bg-gray-600 text-red-400'
                              : 'hover:bg-gray-100 text-red-600'
                          }`}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenShipmentModal(customer)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark
                              ? 'hover:bg-gray-600 text-green-400'
                              : 'hover:bg-gray-100 text-green-600'
                          }`}
                          title="Create Shipment"
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className={`px-6 py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {searchTerm ? 'No customers found matching your search' : 'No customers found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for view/edit/create */}
      <Modal
        isOpen={showModal}
        title={`${modalMode === 'create' ? 'Create' : modalMode === 'edit' ? 'Edit' : 'View'} Customer`}
        onClose={() => setShowModal(false)}
        isDark={isDark}
        size="md"
      >
        {selectedCustomer || modalMode === 'create' ? (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={modalMode === 'view'}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={modalMode === 'view'}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="john@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={modalMode === 'view'}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={modalMode === 'view'}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="New York"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={modalMode === 'view'}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                disabled={modalMode === 'view'}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="United States"
              />
            </div>

            {modalMode !== 'view' && (
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowModal(false)}
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
                  {submitting ? 'Saving...' : modalMode === 'create' ? 'Create' : 'Save'}
                </button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Shipment Modal */}
      <Modal
        isOpen={showShipmentModal}
        title={`Create Shipment for ${selectedCustomer?.fullName || ''}`}
        onClose={() => setShowShipmentModal(false)}
        isDark={isDark}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Senders Name
            </label>
            <input
              type="text"
              value={shipmentData.sendersName}
              onChange={(e) => setShipmentData({ ...shipmentData, sendersName: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Receivers Name
            </label>
            <input
              type="text"
              value={shipmentData.receiversName}
              onChange={(e) => setShipmentData({ ...shipmentData, receiversName: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
              placeholder="Jane Smith"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Origin
              </label>
              <input
                type="text"
                value={shipmentData.origin}
                onChange={(e) => setShipmentData({ ...shipmentData, origin: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="New York"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Destination
              </label>
              <input
                type="text"
                value={shipmentData.destination}
                onChange={(e) => setShipmentData({ ...shipmentData, destination: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="Los Angeles"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Weight (kg)
              </label>
              <input
                type="number"
                value={shipmentData.weight}
                onChange={(e) => setShipmentData({ ...shipmentData, weight: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="5.5"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Price
              </label>
              <input
                type="number"
                value={shipmentData.price}
                onChange={(e) => setShipmentData({ ...shipmentData, price: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="99.99"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setShowShipmentModal(false)}
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
              onClick={handleCreateShipment}
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Shipment'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Deleted Customers Section (Recycle Bin) */}
      <div className="mt-8 space-y-4">
        <button
          onClick={() => setShowDeletedCustomers(!showDeletedCustomers)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isDark
              ? 'bg-gray-800 text-red-400 hover:bg-gray-700'
              : 'bg-gray-100 text-red-600 hover:bg-gray-200'
          }`}
        >
          <Trash className="w-4 h-4" />
          {showDeletedCustomers ? 'Hide' : 'Show'} Deleted Customers ({deletedCustomers.length})
        </button>

        {showDeletedCustomers && (
          <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Deleted Customers (Recycle Bin)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Name
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Email
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Phone
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      City
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deletedCustomers.length > 0 ? (
                    deletedCustomers.map((customer) => (
                      <tr
                        key={customer._id}
                        className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                      >
                        <td className={`px-6 py-4 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {customer.fullName}
                        </td>
                        <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {customer.email}
                        </td>
                        <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {customer.phone}
                        </td>
                        <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {customer.city}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRestoreCustomer(customer._id)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDark
                                  ? 'hover:bg-gray-600 text-green-400'
                                  : 'hover:bg-gray-100 text-green-600'
                              }`}
                              title="Restore Customer"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handlePermanentlyDeleteCustomer(customer._id)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDark
                                  ? 'hover:bg-gray-600 text-red-400'
                                  : 'hover:bg-gray-100 text-red-600'
                              }`}
                              title="Permanently Delete"
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
                        colSpan={5}
                        className={`px-6 py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        No deleted customers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
