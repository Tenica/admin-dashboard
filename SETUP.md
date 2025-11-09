# Admin Dashboard - Setup & Usage Guide

## Quick Start

### 1. Install Dependencies
```bash
cd admin-dashboard
npm install
```

### 2. Configure Backend URL
Edit `.env` file:
```
REACT_APP_API_URL=http://localhost:3000
```

### 3. Start Development Server
```bash
npm start
```

App opens at `http://localhost:3000`

---

## Architecture Overview

```
Frontend (React + Tailwind)     Backend (Node.js + Express)
  - Login Page                    - /auth/login-admin
  - Dashboard                     - /auth/logout-admin
  - Shipments (CRUD)              - /shipment (CRUD)
  - Customers (CRUD)              - /customer (CRUD)
  - Tracking                       - /track/:trackingNumber
  - Dark Mode                     - JWT Authentication
  - Responsive Design             - MongoDB Database
```

---

## Project Structure

```
src/
├── components/common/        # Reusable UI
│   ├── Navbar.tsx           # Top navigation
│   ├── Sidebar.tsx          # Side menu
│   ├── Toast.tsx            # Notifications
│   ├── Modal.tsx            # Dialogs
│   ├── Loading.tsx          # Spinners
│   └── ProtectedRoute.tsx   # Auth guard
├── components/dashboard/
│   └── StatCard.tsx         # Statistics
├── context/
│   ├── AuthContext.tsx      # Authentication
│   └── ToastContext.tsx     # Notifications
├── pages/
│   ├── Login.tsx            # Login form
│   ├── Dashboard.tsx        # Home page
│   ├── Shipments.tsx        # Shipment management
│   ├── Customers.tsx        # Customer management
│   ├── Tracking.tsx         # Track shipments
│   ├── Admins.tsx           # Admin management
│   ├── Settings.tsx         # Settings
│   ├── Map.tsx              # Delivery map
│   └── NotFound.tsx         # 404 page
├── services/
│   └── api.ts               # Axios API calls
├── types/
│   └── index.ts             # TypeScript types
├── App.tsx                  # Main app
└── index.css                # Tailwind CSS
```

---

## Key Features

### Authentication
- Email/password login
- JWT token stored in localStorage
- Auto-logout on token expiration
- Protected routes

### Dashboard
- Real-time statistics
- Recent shipments table
- Responsive grid layout

### Shipments
- List all shipments
- Create new shipment
- Edit shipment status/location
- Delete shipments (soft delete)
- Search functionality

### Customers
- List all customers
- Create new customer
- Edit customer details
- Delete customers (soft delete)
- Search and filter

### Tracking
- Search by tracking number
- View shipment details
- Timeline of events
- Status history

### UI/UX
- Dark mode toggle
- Responsive design
- Toast notifications
- Loading states
- Modal dialogs
- Icon library (Lucide)

---

## Environment Configuration

### .env File
```env
# Required
REACT_APP_API_URL=http://localhost:3000

# Optional
REACT_APP_ENV=development
```

### For Different Backends
```env
# Development
REACT_APP_API_URL=http://localhost:3000

# Production
REACT_APP_API_URL=https://api.yoursite.com

# Staging
REACT_APP_API_URL=https://staging-api.yoursite.com
```

---

## API Integration

All API calls go through `src/services/api.ts`:

### Authentication Service
```typescript
authService.login(email, password)
authService.logout()
authService.createAdmin(fullName, email, password)
```

### Customer Service
```typescript
customerService.getCustomers()
customerService.getCustomerById(id)
customerService.createCustomer(data)
customerService.updateCustomer(id, data)
customerService.deleteCustomer(id)
```

### Shipment Service
```typescript
shipmentService.getShipments()
shipmentService.getShipmentById(id)
shipmentService.createShipment(data)
shipmentService.updateShipment(id, data)
shipmentService.deleteShipment(id)
shipmentService.trackShipment(trackingNumber)
shipmentService.getShipmentTimeline(shipmentId)
```

---

## Common Tasks

### Add a New Page
1. Create `src/pages/MyPage.tsx`
2. Add route in `App.tsx`
3. Add nav item in `Sidebar.tsx`

### Modify Colors
Edit `tailwind.config.js`

### Change API Endpoint
Update `.env` and restart server

### Access User Info
```typescript
import { useAuth } from './context/AuthContext';

const { admin, token } = useAuth();
```

### Show Toast Notification
```typescript
import { useToast } from './context/ToastContext';

const { addToast } = useToast();
addToast('Success!', 'success');
```

---

## Troubleshooting

### "Cannot connect to backend"
- Ensure backend is running
- Check `.env` has correct URL
- Verify CORS is enabled on backend

### "Unauthorized" error
- Login again
- Clear localStorage: `localStorage.clear()`
- Check token expiration in backend

### Styles not showing
- Restart dev server
- Clear cache: `npm cache clean --force`

### API call fails
- Check Network tab in DevTools
- Verify backend endpoints exist
- Check CORS headers

---

## Scripts

```bash
npm start           # Run dev server
npm run build       # Build for production
npm test            # Run tests
npm run eject       # Eject from CRA (not recommended)
```

---

## Browser Compatibility

- Chrome/Edge: Latest
- Firefox: Latest
- Safari: Latest
- Mobile browsers: Full support

---

## Performance Tips

- Dashboard lazy loads shipments
- Pagination ready (in table components)
- Search filters client-side for UX
- Images optimized with Tailwind

---

## Security Notes

- JWT tokens expire after 1 hour (configurable in backend)
- HTTPS recommended for production
- Sensitive data not stored in localStorage (only token)
- API uses Bearer token authentication

---

## Next Steps

1. Start backend server first
2. Configure `.env` with backend URL
3. Run `npm install` and `npm start`
4. Login with admin credentials
5. Explore dashboard features

---

## Support

For issues:
1. Check console (F12)
2. Verify backend is running
3. Check `.env` configuration
4. Review network requests

Happy managing! 🚀
