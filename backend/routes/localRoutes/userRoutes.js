const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getHotelDb } = require("../../utils/dbSwitcher");
const orderSchema = require("../../models/orderModel");
router.post("/getTokenFromQR", (req, res) => {  
  const { hotelName, tableNumber } = req.body;

  if (!hotelName || !tableNumber) {
    return res.status(400).json({ msg: "Missing hotelName or tableNumber" });
  }

  // Generate token valid for 2 hours
  const token = jwt.sign({ hotelName, tableNumber }, process.env.JWT_SECRET, {
    expiresIn: "2h"
  });

  res.json({ token });
});


router.post("/placeOrder", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ msg: "No token provided." });
  
      // Decode token to extract hotelName and tableNumber
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { hotelName, tableNumber } = decoded;
  
      if (!hotelName || !tableNumber) {
        return res.status(400).json({ msg: "Invalid token data." });
      }
  
      const db = getHotelDb(hotelName);
      const Order = db.model("Order", orderSchema);
  
      const { items, totalAmount } = req.body;
      if (!items || !Array.isArray(items) || !totalAmount) {
        return res.status(400).json({ msg: "Invalid order data." });
      }
  
      const newOrder = new Order({
        tableNumber,
        items,
        totalAmount,
        status: "pending",
        timestamp: new Date()
      });
  
      await newOrder.save();

      // Get io instance from app and emit event
      const io = req.app.get('io');
      if (io) {
        io.emit('new_order', newOrder);
      }
  
      res.status(201).json({ msg: "Order placed successfully!", order: newOrder });
    } catch (err) {
      console.error("Order placement error:", err);
      res.status(500).json({ msg: "Server error" });
    }
});
  
module.exports = router;