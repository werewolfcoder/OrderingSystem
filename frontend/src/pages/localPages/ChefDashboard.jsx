import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../../socket';
import axios from 'axios';

const ChefDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('chefToken');
    if (!token) {
      navigate('/chef/login');
      return;
    }

    // Fetch existing orders
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/chef/getPendingOrders`,
          {
            headers: { Authorization: token }
          }
        );
        setOrders(response.data.orders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    };

    fetchOrders();

    // Listen for new orders
    socket.on('new_order', (order) => {
      setOrders(prev => [...prev, order]);
      setNotification({
        message: `New Order #${order._id}`,
        details: `${order.items.length} items - Total: ₹${order.totalAmount}`
      });
      setTimeout(() => setNotification(null), 5000);
    });

    return () => {
      socket.off('new_order');
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('chefToken');
    navigate('/chef/login');
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('chefToken');
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/chef/updateOrderStatus`,
        { orderId, status: newStatus },
        { headers: { Authorization: token }
      });

      if (response.data.success) {
        // Update local state
        setOrders(prev => prev.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));

        // Emit socket event for status update
        socket.emit('order_status_update', { 
          orderId, 
          status: newStatus 
        });

        setNotification({
          message: `Order #${orderId}`,
          details: `Status updated to ${newStatus}`
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Chef Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg">
          <h4 className="font-semibold">{notification.message}</h4>
          <p className="text-sm">{notification.details}</p>
        </div>
      )}

      {/* Orders Display */}
      {orders.length === 0 ? (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center bg-white rounded-lg shadow-sm p-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Nothing to Serve Yet
            </h2>
            <p className="text-gray-600">
              New orders will appear here when customers place them.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              The page will automatically update when new orders arrive.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid gap-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Order #{order._id}</h3>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {order.status}
                  </span>
                </div>
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between py-2 border-b">
                    <span>{item.name} × {item.qty}</span>
                    <span>₹{item.price}</span>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'preparing')}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Start Preparing
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Cancel Order
                        </button>
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'served')}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Mark as Served
                      </button>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'served' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChefDashboard;
