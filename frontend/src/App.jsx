import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RestaurantMenu from './pages/RestaurantMenu'
import PaymentPage from './pages/PaymentPage'
import AdminPage from './pages/AdminPage' // Import AdminPage
import UpdateMenu from './pages/UpdateMenu' // Import UpdateMenu
import { OrderProvider } from './context/OrderContext'

function App() {
  return (
    <OrderProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RestaurantMenu />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/admin" element={<AdminPage />} /> {/* Add AdminPage route */}
          <Route path="/admin/menu" element={<UpdateMenu />} /> {/* Add UpdateMenu route */}
        </Routes>
      </Router>
    </OrderProvider>
  )
}

export default App
