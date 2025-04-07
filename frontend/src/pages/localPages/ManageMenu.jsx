import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ManageMenu = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editingCategories, setEditingCategories] = useState({});

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/getItems`);
      setMenuItems(response.data.items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/getCategories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/admin/deleteItem/${id}`);
      setMenuItems(prevItems => prevItems.filter(item => item._id !== id));
      setStatusMessage({ text: 'Item deleted successfully', isError: false });
      setTimeout(() => setStatusMessage({ text: '', isError: false }), 3000);
    } catch (error) {
      console.error('Error deleting item:', error);
      setStatusMessage({ text: 'Failed to delete item', isError: true });
      setTimeout(() => setStatusMessage({ text: '', isError: false }), 3000);
    }
  };

  const handleEdit = (item) => {
    setEditingItem({
      ...item,
      category: item.category._id // Set initial category ID
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('categoryId', editingItem.category);
      formData.append('name', editingItem.name);
      formData.append('description', editingItem.description);
      formData.append('price', editingItem.price);
      if (editingItem.newImage) {
        formData.append('image', editingItem.newImage);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/admin/updateItem/${editingItem._id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data && response.data.item) {
        setMenuItems(prevItems => 
          prevItems.map(item => 
            item._id === editingItem._id ? response.data.item : item
          )
        );
        setStatusMessage({ text: 'Item updated successfully', isError: false });
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      setStatusMessage({ text: 'Failed to update item', isError: true });
    }
    setTimeout(() => setStatusMessage({ text: '', isError: false }), 3000);
  };

  const handleUpdateCategory = async (categoryId) => {
    try {
      const newName = editingCategories[categoryId];
      if (!newName || newName.trim() === '') {
        setStatusMessage({ text: 'Category name cannot be empty', isError: true });
        return;
      }

      await axios.put(`${import.meta.env.VITE_BASE_URL}/admin/updateCategory/${categoryId}`, {
        name: newName
      });

      setStatusMessage({ text: 'Category updated successfully', isError: false });
      fetchCategories();
      const newEditingCategories = { ...editingCategories };
      delete newEditingCategories[categoryId];
      setEditingCategories(newEditingCategories);
    } catch (error) {
      setStatusMessage({ text: 'Failed to update category', isError: true });
    }
    setTimeout(() => setStatusMessage({ text: '', isError: false }), 3000);
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/admin/deleteCategory/${categoryId}`);
      setStatusMessage({ text: 'Category deleted successfully', isError: false });
      fetchCategories();
    } catch (error) {
      const errorMessage = error.response?.status === 400
        ? 'Cannot delete category because it has menu items'
        : 'Failed to delete category';
      setStatusMessage({ text: errorMessage, isError: true });
    }
    setTimeout(() => setStatusMessage({ text: '', isError: false }), 3000);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/admin/menu')} 
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 flex items-center gap-1"
        >
          <span>←</span> Back
        </button>
        <button 
          onClick={() => setShowCategoryModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Manage Categories
        </button>
      </div>

      <h1 className="text-3xl font-bold text-center mb-6">Manage Menu Items</h1>

      {statusMessage.text && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg ${
          statusMessage.isError ? 'bg-red-500' : 'bg-green-500'
        } text-white transition-opacity duration-500`}>
          {statusMessage.text}
        </div>
      )}

      <div className="grid gap-4">
        {menuItems.map(item => (
          <div key={item._id} className="border p-4 rounded-lg shadow-sm">
            <div className="flex gap-4 items-start">
              <div className="flex-grow">
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-gray-600">{item.description}</p>
                <p className="text-sm mt-1">Price: ₹{item.price}</p>
              </div>
              <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                <img
                  src={`${import.meta.env.VITE_BASE_URL}${item.imageUrl}`}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/96';
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between gap-2 mt-4 pt-3 border-t">
              <button 
                onClick={() => handleEdit(item)}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(item._id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[500px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Edit Menu Item</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Add category selection dropdown */}
              <div>
                <label className="block text-gray-700">Category:</label>
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                  className="border rounded px-3 py-2 w-full"
                >
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700">Name:</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700">Description:</label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700">Price:</label>
                <input
                  type="number"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({...editingItem, price: e.target.value})}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700">Current Image:</label>
                <img
                  src={`${import.meta.env.VITE_BASE_URL}${editingItem.imageUrl}`}
                  alt={editingItem.name}
                  className="w-32 h-32 object-cover rounded mt-1"
                />
              </div>
              <div>
                <label className="block text-gray-700">Update Image:</label>
                <input
                  type="file"
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    newImage: e.target.files[0]
                  })}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Update Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Manage Categories</h3>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              {categories.map(category => (
                <div key={category._id} className="flex items-center gap-2 p-3 border rounded">
                  <input
                    type="text"
                    defaultValue={category.name}
                    onChange={(e) => setEditingCategories({
                      ...editingCategories,
                      [category._id]: e.target.value
                    })}
                    className="flex-grow px-2 py-1 border rounded"
                  />
                  <button
                    onClick={() => handleUpdateCategory(category._id)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMenu;
