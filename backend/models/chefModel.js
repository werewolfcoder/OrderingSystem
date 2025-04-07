const mongoose = require("mongoose");

const chefSchema = new mongoose.Schema({
  chefId: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "chef",
  },
}, { timestamps: true });

module.exports = chefSchema; // <-- export the schema, NOT model
