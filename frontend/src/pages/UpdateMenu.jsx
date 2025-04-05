import React, { useState } from 'react';
import axios from 'axios';

const UpdateMenu = () => {
  const [newItem, setNewItem] = useState({
    category: '',
    name: '',
    description: '',
    price: '',
    image: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setNewItem((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleAddItem = async () => {
    if (!newItem.category || !newItem.name || !newItem.description || !newItem.price || !newItem.image) {
      alert('Please fill in all fields and upload an image.');
      return;
    }

    const formData = new FormData();
    formData.append('category', newItem.category);
    formData.append('name', newItem.name);
    formData.append('description', newItem.description);
    formData.append('price', newItem.price);
    formData.append('image', newItem.image);

    try {
      const response = await axios.post('http://localhost:3000/api/admin/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Food item added successfully!');
      setNewItem({ category: '', name: '', description: '', price: '', image: null });
    } catch (error) {
      console.error('Error adding food item:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Failed to add food item: ${error.response.data.message}`);
      } else {
        alert('Failed to add food item due to an unknown error.');
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center">Update Menu</h1>
      <p className="text-center text-gray-600 mt-2">Add new food items to the database.</p>

      <div className="mt-6 border p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Add New Food Item</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Category:</label>
          <input
            type="text"
            name="category"
            value={newItem.category}
            onChange={handleInputChange}
            className="border rounded px-3 py-2 w-full"
            placeholder="Enter category (e.g., Appetizers)"
          />
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
        <button
          onClick={handleAddItem}
          className="px-4 py-2 bg-gray-800 text-white rounded"
        >
          Add Food Item
        </button>
      </div>
    </div>
  );
};

export default UpdateMenu;
