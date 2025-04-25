import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { socket } from '../../socket';
import axios from 'axios';

const OrderDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order: initialOrder } = location.state || {};
  const [order, setOrder] = useState(initialOrder);
  const [currentStatus, setCurrentStatus] = useState(initialOrder?.status);
  const [statusNotification, setStatusNotification] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!initialOrder?._id) return;
      
      try {
        const token = localStorage.getItem('guestToken');
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/user/getOrder/${initialOrder._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (response.data.success) {
          setOrder(response.data.order);
          setCurrentStatus(response.data.order.status);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      }
    };

    fetchOrder();
  }, [initialOrder?._id]);

  useEffect(() => {
    // Join order-specific room
    if (order?._id) {
      socket.emit('join_order_room', order._id);
    }

    // Listen for status updates
    socket.on('order_status_update', (data) => {
      if (data.orderId === order?._id) {
        setCurrentStatus(data.status);
        setStatusNotification(`Order status updated to: ${data.status}`);
        setTimeout(() => setStatusNotification(''), 3000);
      }
    });

    return () => {
      socket.off('order_status_update');
      if (order?._id) {
        socket.emit('leave_order_room', order._id);
      }
    };
  }, [order?._id]);

  if (!order) {
    return <div>No order details found</div>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <button 
        onClick={() => navigate('/')} 
        className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        ← Back to Menu
      </button>

      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Order Confirmation</h1>
        
        {statusNotification && (
          <div className="mb-4 px-4 py-2 bg-blue-100 text-blue-800 rounded">
            {statusNotification}
          </div>
        )}

        <div className="mb-4">
          <p className="text-gray-600">Order ID: {order._id}</p>
          <p className="text-gray-600">Table Number: {order.tableNumber}</p>
          <p className="text-gray-600">
            Status: 
            <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
              currentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              currentStatus === 'preparing' ? 'bg-blue-100 text-blue-800' :
              currentStatus === 'served' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentStatus}
            </span>
          </p>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between py-2 border-b">
              <div>
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-600 ml-2">x{item.qty}</span>
              </div>
              <span>₹{(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between font-bold">
              <span>Total Amount:</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
