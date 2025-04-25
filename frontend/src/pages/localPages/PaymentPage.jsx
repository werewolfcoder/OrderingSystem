import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';
import axios from 'axios';
import { socket } from '../../socket';

const PaytmPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useOrder();
  const { total, menuItems } = location.state || { total: 0, menuItems: [] };
  const [amount, setAmount] = useState(total);
  const [orderId, setOrderId] = useState(`ORDER_${new Date().getTime()}`);
  const [customerId, setCustomerId] = useState(`CUST_${new Date().getTime()}`);

  // const handlePayment = async () => {
  //   try {
  //     // First place the order
  //     const orderData = {
  //       items: Object.entries(cart).map(([itemId, quantity]) => {
  //         const items = menuItems.find((item) => item._id === itemId);
  //         return {
  //           name: items.name,
  //           qty: quantity,
  //           price: items.price
  //         };
  //       }),
  //       totalAmount: total,
  //     };

  //     const token = localStorage.getItem('guestToken');
  //     const orderResponse = await axios.post(
  //       `${import.meta.env.VITE_BASE_URL}/user/placeOrder`, 
  //       {items:orderData.items,totalAmount:orderData.totalAmount},
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${token}`
  //         }
  //       }
  //     );

  //     if (orderResponse.data && orderResponse.data.order) {
  //       // Emit new order event
  //       socket.emit('new_order', orderResponse.data.order);
        
  //       // Navigate to order details page with order data
  //       navigate('/order-details', { 
  //         state: { 
  //           order: orderResponse.data.order,
  //         }
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Order placement failed:', error);
  //     alert('Failed to place order. Please try again.');
  //   }
  // };
  const handlePayment = async () => {
    try {
      console.log("Starting order placement...");
      
      // Log the cart data to verify it's correct
      console.log("Cart contents:", cart);
      console.log("Menu items:", menuItems);
      
      // First place the order
      const orderData = {
        items: Object.entries(cart).map(([itemId, quantity]) => {
          const item = menuItems.find((item) => item._id === itemId);
          console.log(`Processing item ${itemId}:`, item);
          if (!item) {
            console.error(`Item ${itemId} not found in menuItems!`);
            return null; // This will cause issues later but helps identify the problem
          }
          return {
            name: item.name,
            qty: quantity,
            price: item.price
          };
        }),
        totalAmount: total,
      };
      
      // Log the constructed order data
      console.log("Order data being sent:", orderData);
      
      const token = localStorage.getItem('guestToken');
      console.log("Token being used:", token ? token.substring(0, 10) + "..." : "No token");
      
      const orderResponse = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/placeOrder`,
        {items: orderData.items, totalAmount: orderData.totalAmount},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log("Order response:", orderResponse.data);
      
      if (orderResponse.data && orderResponse.data.order) {
        console.log("Order successfully placed. Order ID:", orderResponse.data.order._id);
        
        // Emit new order event
        socket.emit('new_order', orderResponse.data.order);
        console.log("Socket event emitted");
        
        // Navigate to order details page with order data
        navigate('/order-details', {
          state: {
            order: orderResponse.data.order,
          }
        });
      } else {
        console.warn("Order response doesn't contain expected data:", orderResponse.data);
        alert('Unexpected server response. Please check console for details.');
      }
    } catch (error) {
      console.error('Order placement failed:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Failed to place order. Please check console for details.');
    }
  };
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <button 
        onClick={() => navigate('/')} 
        className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        ← Back to Menu
      </button>

      <h1 className="text-2xl font-bold mb-6">Order Summary & Payment</h1>

      <div className="bg-gray-50 p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>
        {Object.entries(cart).map(([itemId, quantity]) => {
          const item = menuItems?.find(item => item.id === parseInt(itemId));
          if (!item) return null;
          
          return (
            <div key={itemId} className="flex justify-between py-2 border-b">
              <div>
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-600 ml-2">x{quantity}</span>
              </div>
              <span>${(item.price * quantity).toFixed(2)}</span>
            </div>
          );
        })}
        
        <div className="mt-4 pt-4 border-t border-gray-300">
          <div className="flex justify-between font-bold">
            <span>Total Amount:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-gray-700">Amount to Pay:</label>
          <input
            type="number"
            id="amount"
            value={amount}
            readOnly
            className="border rounded px-3 py-2 w-full bg-gray-100"
          />
        </div>
        <button
          onClick={handlePayment}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Proceed to Pay
        </button>
      </div>
    </div>
  );
};

export default PaytmPayment;
