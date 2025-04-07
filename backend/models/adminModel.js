const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  hotelName: {
    type: String,
    required: true,
    unique: true
  },
  adminName: {
    type: String,
    required: true
  },
  username:{
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Admin", adminSchema);
