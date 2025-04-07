# Restaurant Management System

A full-stack web application for managing restaurant orders, menu items, and staff operations.

## Features

### Customer Side
- **QR Code Based Menu Access**: Customers can scan table-specific QR codes to access the digital menu
- **Digital Menu**: Browse menu items categorized by food types
- **Cart Management**: Add/remove items, adjust quantities
- **Order Tracking**: Real-time updates on order status (pending, preparing, served, cancelled)

### Chef Dashboard
- **Live Order Management**: View incoming orders in real-time
- **Order Status Updates**: Update order status (preparing, served, cancelled)
- **Secure Access**: Protected routes with JWT authentication
- **Real-time Notifications**: Instant alerts for new orders

### Admin Panel
- **Menu Management**: 
  - Add/edit/delete menu items
  - Manage food categories
  - Upload food images
- **Staff Management**: Create and manage chef accounts
- **QR Code Generation**: Generate table-specific QR codes
- **Access Control**: Secure admin operations with JWT

## Tech Stack

### Frontend
- React.js with Vite
- TailwindCSS for styling
- Socket.IO client for real-time features
- Axios for API calls
- React Router for navigation

### Backend
- Node.js & Express
- MongoDB with Mongoose
- Socket.IO for real-time communication
- JWT for authentication
- Multer for file uploads

## Multi-Hotel Architecture

### Dynamic Database Management
- Each hotel gets its own MongoDB database (`orderingSystem_[hotelName]`)
- Dynamic database switching using the `dbSwitcher` utility
- Prevents data mixing between different hotels

### User Role Hierarchy
```
System
└── Global Level
    └── Admin Registration/Login
        └── Hotel Level
            ├── Admin Dashboard
            │   ├── Menu Management
            │   ├── Chef Management
            │   └── QR Generation
            └── Chef Dashboard
                └── Order Management

```

### Database Isolation
- Global database: Stores hotel admin registrations
- Hotel-specific databases:
  - Menu items
  - Categories
  - Orders
  - Chef accounts
  - QR codes

### Authentication Flow
1. **Global Admin Auth**
   - Unique username per hotel admin
   - JWT contains hotelName for database routing
   - Manages hotel-specific operations

2. **Chef Auth**
   - Created by hotel admin
   - Access limited to specific hotel
   - JWT includes hotel context

3. **Customer Access**
   - QR code contains hotel identifier
   - Table-specific token generation
   - Isolated to single hotel menu

### Data Isolation Example
```javascript
// Different databases for different hotels
orderingSystem_hotel1/
  ├── menu
  ├── orders
  └── chefs

orderingSystem_hotel2/
  ├── menu
  ├── orders
  └── chefs
```

### Security Features
- Database level isolation
- Role-based access control
- Hotel-specific JWT tokens
- Separate API routes for global/local operations

## Implementation Details

### Dynamic Database Connection
```javascript
// Database switching based on hotel context
const hotelDb = getHotelDb(hotelName);
const Order = hotelDb.model("Order", orderSchema);
```

### Token-based Hotel Context
```javascript
// JWT contains hotel identifier
const token = jwt.sign(
  { 
    id: admin._id,
    hotelName: admin.hotelName,
    role: "admin"
  },
  JWT_SECRET
);
```

### API Route Separation
- `/global/*` - System-wide admin operations
- `/admin/*` - Hotel-specific admin operations
- `/chef/*` - Hotel-specific chef operations
- `/user/*` - Customer-facing operations

This architecture ensures:
- Complete data isolation between hotels
- Scalable multi-tenant system
- Secure role-based access
- Independent hotel operations



