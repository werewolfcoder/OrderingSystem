const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // prevents duplicate categories
    trim: true
  }
});

module.exports = categorySchema
