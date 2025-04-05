import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';
import axios from 'axios';

const PaytmPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useOrder();
  const { total, menuItems } = location.state || { total: 0, menuItems: [] };
  const [amount, setAmount] = useState(total);
  const [orderId, setOrderId] = useState(`ORDER_${new Date().getTime()}`);
  const [customerId, setCustomerId] = useState(`CUST_${new Date().getTime()}`);

  const handlePayment = async () => {
    try {
      const { data } = await axios.post('http://localhost:5000/payment', {
        amount,
        customerId,
        orderId,
      });

      const form = document.createElement('form');
      form.setAttribute('method', 'post');
      form.setAttribute('action', 'https://securegw-stage.paytm.in/order/process');
      Object.keys(data).forEach((key) => {
        const input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', key);
        input.setAttribute('value', data[key]);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error('Payment initiation failed:', error);
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
