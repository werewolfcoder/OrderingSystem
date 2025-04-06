import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Add this import

const UpdateMenu = () => {
  const navigate = useNavigate(); // Add this hook
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });
  const [newItem, setNewItem] = useState({
    category: '',
    name: '',
    description: '',
    price: '',
    image: null,
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/getCategories`);
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    };
    getCategories();
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setNewItem((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleAddItem = async () => {
    if (!newItem.category || !newItem.name || !newItem.description || !newItem.price || !newItem.image) {
      setStatusMessage({ text: 'Please fill in all fields and upload an image.', isError: true });
      setTimeout(() => setStatusMessage({ text: '', isError: false }), 3000);
      return;
    }
    const formData = new FormData();
    formData.append('categoryId', newItem.category); // Changed from 'category' to 'categoryId'
    formData.append('name', newItem.name);
    formData.append('description', newItem.description);
    formData.append('price', newItem.price);
    formData.append('image', newItem.image);

    try {
      console.log('Form Data:', Object.fromEntries(formData)); // Better debugging
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin/addItem`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data && response.data.item) {
        setStatusMessage({ text: 'Menu item added successfully!', isError: false });
        setNewItem({
          category: '',
          name: '',
          description: '',
          price: '',
          image: null,
        });
      } else {
        setStatusMessage({ text: 'Unexpected response. Please try again.', isError: true });
      }
      setTimeout(() => setStatusMessage({ text: '', isError: false }), 3000);
    } catch (error) {
      console.error('Error adding item:', error);
      setStatusMessage({ text: 'Error adding item. Please try again.', isError: true });
      setTimeout(() => setStatusMessage({ text: '', isError: false }), 3000);
      return;
    }
  };

  async function handleAddCategory() {
    if (!category) {
      setStatusMessage({ text: 'Please enter a category name.', isError: true });
      setTimeout(() => setStatusMessage({ text: '', isError: false }), 3000);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin/addCategory`,
        { name: category },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.category) {  // Changed condition to check for category in response
        setStatusMessage({ text: 'Category added successfully!', isError: false });
        setCategory('');
        setShowCategoryModal(false);
        // Refresh categories list
        const categoriesResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/getCategories`);
        setCategories(categoriesResponse.data.categories);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add category. Please try again.';
      setStatusMessage({ text: errorMessage, isError: true });
    }
    setTimeout(() => setStatusMessage({ text: '', isError: false }), 3000);
  }

  return (
    <div className="p-4">
      {/* Status Message */}
      {statusMessage.text && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg ${
          statusMessage.isError ? 'bg-red-500' : 'bg-green-500'
        } text-white transition-opacity duration-500`}>
          {statusMessage.text}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/admin')} 
          className="px-3 py-1.5 bg-gray-800 text-white rounded text-sm hover:bg-gray-900 flex items-center gap-1"
        >
          <span>←</span> Back
        </button>
        <button
          onClick={() => navigate('/admin/manage-menu')}
          className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
        >
          Update Menu <span>→</span>
        </button>
      </div>

      <h1 className="text-3xl font-bold text-center">Add Menu</h1>
      <p className="text-center text-gray-600 mt-2">Add new food items to the database.</p>

      <div className="mt-6 border p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Add New Food Item</h2>

        <div className="mb-4">
          <label className="block text-gray-700">Category:</label>
          <select
            name="category"
            value={newItem.category}
            onChange={handleInputChange}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Name:</label>
          <input
            type="text"
            name="name"
            value={newItem.name}
            onChange={handleInputChange}
            className="border rounded px-3 py-2 w-full"
            placeholder="Enter food name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Description:</label>
          <textarea
            name="description"
            value={newItem.description}
            onChange={handleInputChange}
            className="border rounded px-3 py-2 w-full"
            placeholder="Enter food description"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Price:</label>
          <input
            type="number"
            name="price"
            value={newItem.price}
            onChange={handleInputChange}
            className="border rounded px-3 py-2 w-full"
            placeholder="Enter food price"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Image:</label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div className="flex justify-between items-center">
          <button
            onClick={handleAddItem}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Add Food Item
          </button>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Add New Category
          </button>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Add New Category</h3>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded px-3 py-2 w-full mb-4"
              placeholder="Enter category name"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateMenu;
