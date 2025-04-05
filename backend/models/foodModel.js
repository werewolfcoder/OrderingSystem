const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  category: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true }, // Store cloud image URL
});

const FoodItem = mongoose.model('FoodItem', foodItemSchema); // Create and export the model

module.exports = FoodItem;

