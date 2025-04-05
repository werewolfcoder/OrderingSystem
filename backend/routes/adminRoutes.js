const express = require('express');
const multer = require('multer');
const path = require('path');
const FoodItem = require('../models/foodModel'); // Correctly import the FoodItem model

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../Food_Images/')); // Save images in the foods folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

const upload = multer({ storage });

// Route to get all food items
router.get('/menu', async (req, res) => {
  try {
    const foodData = await FoodItem.find(); // Fetch all food items
    res.status(200).json(foodData); // Send the data as JSON
  } catch (error) {
    console.error('Error fetching menu data:', error);
    res.status(500).json({ message: 'Failed to fetch menu data' });
  }
});

// Route to add a new food item with image handling
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { category, name, description, price } = req.body;

    // Validate required fields
    if (!category || !name || !description || !price) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const imagePath = req.file ? `/Food_Images/${req.file.filename}` : ''; // Save image path if uploaded

    const newFoodItem = new FoodItem({ category, name, description, price, image: imagePath });
    await newFoodItem.save();
    res.status(201).json({ message: 'Food item added successfully', foodItem: newFoodItem });
  } catch (error) {
    console.error('Error adding food item:', error); // Log the error for debugging
    res.status(500).json({ message: 'Failed to add food item' });
  }
});

// Route to update a food item
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const updatedFoodItem = await FoodItem.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json({ message: 'Food item updated successfully', foodItem: updatedFoodItem });
  } catch (error) {
    console.error('Error updating food item:', error);
    res.status(500).json({ message: 'Failed to update food item' });
  }
});

// Route to delete a food item
router.delete('/remove/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await FoodItem.findByIdAndDelete(id);
    res.status(200).json({ message: 'Food item deleted successfully' });
  } catch (error) {
    console.error('Error deleting food item:', error);
    res.status(500).json({ message: 'Failed to delete food item' });
  }
});

module.exports = router;
