const express = require('express');
const FoodCategory = require('../models/foodModel'); // Import the FoodCategory model

const router = express.Router();

// Route to get all food data
router.get('/foods', async (req, res) => {
  try {
    const foodData = await FoodCategory.find(); // Fetch all food categories and items
    res.status(200).json(foodData); // Send the data as JSON
  } catch (error) {
    console.error('Error fetching food data:', error);
    res.status(500).json({ message: 'Failed to fetch food data' });
  }
});

module.exports = router;
