import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RestaurantMenu from './pages/localPages/RestaurantMenu'
import PaymentPage from './pages/localPages/PaymentPage'
import AdminPage from './pages/localPages/AdminPage' // Import AdminPage
import UpdateMenu from './pages/localPages/UpdateMenu' // Import UpdateMenu
import ManageMenu from './pages/localPages/ManageMenu' // Import ManageMenu
import AdminRegister from './pages/globalPages/adminRegister' // Add this import
import AdminLogin from './pages/globalPages/adminLogin'
import ChefLogin from './pages/localPages/ChefLogin' // Import ChefLogin
import { OrderProvider } from './context/OrderContext'
import QRScanPage from './pages/localPages/QRScanPage'
import OrderDetails from './pages/localPages/OrderDetails' // Import OrderDetails
import ChefDashboard from './pages/localPages/ChefDashboard' // Import ChefDashboard
import ProtectedChefRoute from './components/ProtectedChefRoute';
import AdminOrderHistory from './pages/localPages/AdminOrderHistory';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

function App() {
  return (
    <OrderProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RestaurantMenu />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/admin/register" element={<AdminRegister />} /> {/* New registration route */}
          <Route path="/admin/login" element={<AdminLogin />} /> {/* New login route */}
          <Route path="/scan" element={<QRScanPage />} />
          <Route path="/chef/login" element={<ChefLogin />} /> {/* Add ChefLogin route */}
          <Route 
            path="/chef/dashboard" 
            element={
              <ProtectedChefRoute>
                <ChefDashboard />
              </ProtectedChefRoute>
            } 
          />
          <Route path="/order-details" element={<OrderDetails />} /> {/* Add OrderDetails route */}
          <Route path="/admin" element={
            <ProtectedAdminRoute>
              <AdminPage />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/menu" element={
            <ProtectedAdminRoute>
              <UpdateMenu />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/manage-menu" element={
            <ProtectedAdminRoute>
              <ManageMenu />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedAdminRoute>
              <AdminOrderHistory />
            </ProtectedAdminRoute>
          } />
        </Routes>
      </Router>
    </OrderProvider>
  )
}

export default App
