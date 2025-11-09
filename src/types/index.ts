// Admin types
export interface Admin {
  _id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  isBlocked: boolean;
  timestamp: string;
}

// Customer types
export interface Customer {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Shipment types
export interface ShipmentHistory {
  status: string;
  note?: string;
  updatedAt: string;
}

export interface Shipment {
  _id: string;
  trackingNumber: string;
  customer: string | Customer;
  admin: string | Admin;
  origin: string;
  destination: string;
  sendersName: string;
  receiversName: string;
  weight?: number;
  price?: number;
  status: 'pending' | 'assigned' | 'in-transit' | 'delivered' | 'cancelled';
  location?: string;
  history: ShipmentHistory[];
  isDeleted: boolean;
  createdAt: string;
  deliveredAt?: string;
}

// Tracking types
export interface TrackingEvent {
  _id: string;
  shipment: string;
  status: string;
  location?: string;
  timestamp: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  total?: number;
  customers?: T;
  shipments?: T;
  customer?: T;
  admin?: T;
  token?: string;
  timeline?: TrackingEvent[];
  shipment?: T;
}

export interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Toast notification types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}
