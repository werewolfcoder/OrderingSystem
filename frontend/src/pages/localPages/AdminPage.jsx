import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminPage = () => {
  const navigate = useNavigate();
  const [showChefDialog, setShowChefDialog] = useState(false);
  const [chefData, setChefData] = useState({ chefId: '', password: '' });
  const [status, setStatus] = useState({ msg: '', isError: false });
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [qrCode, setQrCode] = useState({ image: '', url: '' });
  const [qrStatus, setQrStatus] = useState({ msg: '', isError: false });

  const handleCreateChef = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      setStatus({ msg: 'Please login again', isError: true });
      setTimeout(() => navigate('/admin/login'), 2000);
      return;
    }

    try {
      // Remove Bearer prefix if it exists
      const tokenValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin/create-chef`,
        chefData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': tokenValue
          }
        }
      );
      setStatus({ msg: 'Chef created successfully!', isError: false });
      setChefData({ chefId: '', password: '' });
      setTimeout(() => {
        setStatus({ msg: '', isError: false });
        setShowChefDialog(false);
      }, 2000);
    } catch (error) {
      console.error('Chef creation error:', error);
      setStatus({ 
        msg: error.response?.data?.msg || 'Failed to create chef', 
        isError: true 
      });
      if (error.response?.status === 403) {
        setTimeout(() => navigate('/admin/login'), 2000);
      } else {
        setTimeout(() => setStatus({ msg: '', isError: false }), 3000);
      }
    }
  };

  const handleGenerateQR = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      setQrStatus({ msg: 'Please login again', isError: true });
      setTimeout(() => navigate('/admin/login'), 2000);
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/admin/generate-qr`, {
          params: { tableNumber },
          headers: {
            Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
          }
        }
      );

      setQrCode({
        image: response.data.qrImage,
        url: response.data.qrUrl
      });
      setQrStatus({ msg: 'QR Code generated successfully!', isError: false });
    } catch (error) {
      console.error('QR generation error:', error);
      setQrStatus({ 
        msg: error.response?.data?.msg || 'Failed to generate QR code', 
        isError: true 
      });
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCode.image;
    link.download = `table-${tableNumber}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center">Admin Dashboard</h1>
      <p className="text-center text-gray-600 mt-2">
        Manage your restaurant's menu, orders, and more.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-bold">Manage Menu</h2>
          <p className="text-gray-600 mt-2">
            Add, edit, or remove items from your restaurant's menu.
          </p>
          <button
            onClick={() => navigate('/admin/menu')}
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded"
          >
            Go to Menu Management
          </button>
        </div>

        <div className="border p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-bold">View Orders</h2>
          <p className="text-gray-600 mt-2">
            Check and manage customer orders in real-time.
          </p>
          <button className="mt-4 px-4 py-2 bg-gray-800 text-white rounded">
            Go to Orders
          </button>
        </div>

        <div className="border p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-bold">Settings</h2>
          <p className="text-gray-600 mt-2">
            Update your restaurant's settings and preferences.
          </p>
          <button className="mt-4 px-4 py-2 bg-gray-800 text-white rounded">
            Go to Settings
          </button>
        </div>

        <div className="border p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-bold">Manage Chefs</h2>
          <p className="text-gray-600 mt-2">
            Create and manage chef accounts for your restaurant.
          </p>
          <button
            onClick={() => setShowChefDialog(true)}
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded"
          >
            Create Chef
          </button>
        </div>

        <div className="border p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-bold">Generate QR Codes</h2>
          <p className="text-gray-600 mt-2">
            Generate QR codes for restaurant tables.
          </p>
          <button
            onClick={() => setShowQRDialog(true)}
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded"
          >
            Generate QR Code
          </button>
        </div>
      </div>

      {/* QR Code Generation Dialog */}
      {showQRDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Generate Table QR Code</h3>
            {qrStatus.msg && (
              <div className={`mb-4 px-3 py-2 rounded ${
                qrStatus.isError ? 'bg-red-500' : 'bg-green-500'
              } text-white`}>
                {qrStatus.msg}
              </div>
            )}
            <form onSubmit={handleGenerateQR} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Table Number
                </label>
                <input
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              
              {qrCode.image && (
                <div className="mt-4 flex flex-col items-center">
                  <img 
                    src={qrCode.image} 
                    alt={`QR Code for Table ${tableNumber}`}
                    className="w-48 h-48"
                  />
                  <button
                    type="button"
                    onClick={handleDownloadQR}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Download QR Code
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowQRDialog(false);
                    setQrCode({ image: '', url: '' });
                    setTableNumber('');
                    setQrStatus({ msg: '', isError: false });
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chef Creation Dialog */}
      {showChefDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Create New Chef</h3>
            {status.msg && (
              <div className={`mb-4 px-3 py-2 rounded ${
                status.isError ? 'bg-red-500' : 'bg-green-500'
              } text-white`}>
                {status.msg}
              </div>
            )}
            <form onSubmit={handleCreateChef} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Chef ID</label>
                <input
                  type="text"
                  value={chefData.chefId}
                  onChange={(e) => setChefData({...chefData, chefId: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={chefData.password}
                  onChange={(e) => setChefData({...chefData, password: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowChefDialog(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                >
                  Create Chef
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
