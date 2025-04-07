import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChefLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    hotelName: '',
    chefId: '',
    password: ''
  });
  const [status, setStatus] = useState({ msg: '', isError: false });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/chef/login`,
        credentials,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data && response.data.token) {
        localStorage.setItem('chefToken', `Bearer ${response.data.token}`);
        setStatus({ msg: 'Login successful!', isError: false });
        setTimeout(() => {
          navigate('/chef/dashboard'); // You'll need to create this route
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'Login failed. Please try again.';
      setStatus({ msg: errorMessage, isError: true });
      setTimeout(() => setStatus({ msg: '', isError: false }), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Chef Login</h2>
        {status.msg && (
          <div className={`mb-4 px-4 py-2 rounded ${status.isError ? 'bg-red-500' : 'bg-green-500'} text-white`}>
            {status.msg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Hotel Name</label>
            <input
              type="text"
              name="hotelName"
              value={credentials.hotelName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Chef ID</label>
            <input
              type="text"
              name="chefId"
              value={credentials.chefId}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-900 text-white rounded-md font-semibold transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChefLogin;
