# AguDaniel Logistics Admin Dashboard

Professional admin dashboard for managing customers, shipments, and logistics operations with real-time tracking.

## Features

- **Customer Management** - CRUD operations with soft delete and recycle bin
- **Shipment Management** - Full lifecycle management with timeline tracking
- **Real-time Tracking** - Live shipment status and location updates
- **Authentication** - JWT-based secure login and signup
- **Dark Mode** - Full dark theme support
- **Mobile Responsive** - Fully responsive design for all devices
- **Location Tracking** - Current package location tracking
- **Timeline Events** - Complete shipment history with timestamps

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v3, React Router v7
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React

## Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development
npm start
```

## Build & Deploy

```bash
# Build for production
npm run build

# Deploy to Vercel
# 1. Push to GitHub
# 2. Connect repository in Vercel dashboard
# 3. Set REACT_APP_API_URL environment variable
# 4. Deploy
```

## Environment Variables

```
REACT_APP_API_URL=https://your-backend-api.vercel.app
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React Context (Auth, Toast)
├── pages/          # Page components
├── services/       # API service layer
├── types/          # TypeScript interfaces
└── App.tsx         # Main app
```

## API Endpoints

**Auth**: `/auth/login-admin`, `/auth/create-admin`, `/auth/logout-admin`
**Customers**: `/customer/*` endpoints
**Shipments**: `/shipment/*` endpoints

## Deployment

### To Vercel
1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

For detailed instructions, see documentation.

## License

Proprietary - AguDaniel Logistics
# logistics-admin-dashboard
