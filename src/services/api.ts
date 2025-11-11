import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse, Admin, Customer, Shipment, TrackingEvent } from '../types';

// Get base URL from environment variable or default
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('Token expired or invalid. Redirecting to login...');
      localStorage.removeItem('token');
      localStorage.removeItem('admin');

      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============= AUTH SERVICES =============
export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<Admin>> {
    try {
      const response = await api.post<ApiResponse<Admin>>('/auth/login-admin', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await api.post<ApiResponse<void>>('/auth/logout-admin');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createAdmin(
    fullName: string,
    email: string,
    password: string
  ): Promise<ApiResponse<Admin>> {
    try {
      const response = await api.post<ApiResponse<Admin>>('/auth/create-admin', {
        fullName,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============= CUSTOMER SERVICES =============
export const customerService = {
  async getCustomers(): Promise<ApiResponse<Customer[]>> {
    try {
      const response = await api.get<ApiResponse<Customer[]>>('/customer/getAllCustomers');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    try {
      const response = await api.get<ApiResponse<Customer>>(`/customer/viewcustomer/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createCustomer(customerData: Omit<Customer, '_id' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<ApiResponse<Customer>> {
    try {
      const response = await api.post<ApiResponse<Customer>>('/customer/create-customer', customerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateCustomer(
    id: string,
    customerData: Partial<Omit<Customer, '_id' | 'createdAt' | 'updatedAt' | 'isDeleted'>>
  ): Promise<ApiResponse<Customer>> {
    try {
      const response = await api.put<ApiResponse<Customer>>(`/customer/${id}`, customerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteCustomer(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<ApiResponse<void>>(`/customer/delete-customer/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getDeletedCustomers(): Promise<ApiResponse<Customer[]>> {
    try {
      const response = await api.get<ApiResponse<Customer[]>>('/customer/delete-customers');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async restoreCustomer(id: string): Promise<ApiResponse<Customer>> {
    try {
      const response = await api.put<ApiResponse<Customer>>(`/customer/restore/${id}`, {});
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============= SHIPMENT SERVICES =============
export const shipmentService = {
  async getShipments(): Promise<ApiResponse<Shipment[]>> {
    try {
      const response = await api.get<ApiResponse<Shipment[]>>('/shipment/getAllShipments');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getShipmentById(id: string): Promise<ApiResponse<Shipment>> {
    try {
      const response = await api.get<ApiResponse<Shipment>>(`/shipment/delete-shipment/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createShipment(shipmentData: Omit<Shipment, '_id' | 'history' | 'createdAt' | 'isDeleted'>): Promise<ApiResponse<Shipment>> {
    try {
      console.log('Creating shipment with data:', shipmentData);
      const response = await api.post<ApiResponse<Shipment>>('/shipment/create-shipment', shipmentData);
      console.log('Create shipment response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Create shipment API error:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  async updateShipment(
    id: string,
    shipmentData: Partial<Omit<Shipment, '_id' | 'createdAt' | 'isDeleted' | 'trackingNumber'>>
  ): Promise<ApiResponse<Shipment>> {
    try {
      console.log('Updating shipment with ID:', id);
      console.log('Update data being sent:', shipmentData);
      const response = await api.put<ApiResponse<Shipment>>(`/shipment/update-shipment/${id}`, shipmentData);
      console.log('Update response from backend:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Update shipment API error:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  async deleteShipment(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<ApiResponse<void>>(`/shipment/delete-shipment/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async trackShipment(trackingNumber: string): Promise<ApiResponse<Shipment>> {
    try {
      const response = await api.get<ApiResponse<Shipment>>(`/track/view-tracking/${trackingNumber}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getShipmentTimeline(shipmentId: string): Promise<ApiResponse<{ shipment: Shipment; timeline: TrackingEvent[] }>> {
    try {
      const response = await api.get<ApiResponse<{ shipment: Shipment; timeline: TrackingEvent[] }>>(`/shipment/shipment-timeline/${shipmentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
