import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hotelName: '',
    adminName: '',
    email: '',
    password: '',
  });
  const [status, setStatus] = useState({ msg: '', isError: false });
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/global/register`,
        formData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      setStatus({ msg: 'Registration successful!', isError: false });
      setCredentials({
        username: response.data.admin.username,
        password: formData.password
      });
      setShowCredentials(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.msg || 'Registration failed. Please try again.';
      setStatus({ msg: errorMessage, isError: true });
      setTimeout(() => setStatus({ msg: '', isError: false }), 3000);
    }
  };

  const handleCredentialsConfirm = () => {
    setShowCredentials(false);
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Hotel & Admin Registration</h2>
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
              value={formData.hotelName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Admin Name</label>
            <input
              type="text"
              name="adminName"
              value={formData.adminName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
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
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>
          <button type="submit" className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-900 text-white rounded-md font-semibold transition-colors">
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Already registered?{' '}
          <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/admin')}>
            Login here
          </span>
        </p>
      </div>

      {showCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Save Your Login Credentials</h3>
            <p className="text-gray-600 mb-4">
              Please save these credentials securely. You'll need them to log in:
            </p>
            <div className="bg-gray-50 p-4 rounded-md mb-4 font-mono">
              <div className="mb-2">
                <span className="font-semibold">Username:</span> {credentials.username}
              </div>
              <div>
                <span className="font-semibold">Password:</span> {credentials.password}
              </div>
            </div>
            <p className="text-sm text-red-500 mb-4">
              ⚠️ Make sure to save these credentials! You won't see them again.
            </p>
            <button
              onClick={handleCredentialsConfirm}
              className="w-full py-2 px-4 bg-gray-800 text-white rounded hover:bg-gray-700"
            >
              I've Saved My Credentials
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegister;
