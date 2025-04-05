import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const navigate = useNavigate();

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
            onClick={() => navigate('/admin/menu')} // Navigate to UpdateMenu
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
      </div>
    </div>
  );
};

export default AdminPage;
