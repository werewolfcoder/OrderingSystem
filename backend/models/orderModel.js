const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    items: [itemSchema],

    totalAmount: { type: Number, required: true },

    tableNumber: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "preparing", "served", "cancelled"],
      default: "pending",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = orderSchema; // export only the schema, you'll attach this to hotel DB dynamically
