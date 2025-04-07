// routes/localRoutes/chefRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getHotelDb } = require("../../utils/dbSwitcher");
const chefSchema = require("../../models/chefModel");
const router = express.Router();
const orderSchema = require("../../models/orderModel");
const chefAuth = require('../../middleware/chefAuth');

router.post("/login", async (req, res) => {
  try {
    const { hotelName, chefId, password } = req.body;

    if (!hotelName || !chefId || !password) {
      return res.status(400).json({ msg: "All fields are required." });
    }

    // Get the hotel's DB
    const hotelDb = getHotelDb(hotelName);
    const Chef = hotelDb.model("Chef", chefSchema);

    const chef = await Chef.findOne({ chefId });
    if (!chef) {
      return res.status(404).json({ msg: "Chef not found." });
    }

    const isMatch = await bcrypt.compare(password, chef.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: chef._id, role: "chef", hotelName },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      msg: "Login successful",
      token,
      chef: {
        id: chef._id,
        chefId: chef.chefId,
        role: chef.role,
      }
    });
  } catch (err) {
    console.error("Chef login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ msg: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'chef') {
      return res.status(403).json({ msg: 'Not authorized as chef' });
    }

    res.json({ valid: true });
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
});

router.get("/getPendingOrders", chefAuth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hotelDb = getHotelDb(decoded.hotelName);
    const Order = hotelDb.model("Order", orderSchema);

    const orders = await Order.find({
      status: { $in: ['pending', 'preparing'] }
    }).sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/updateOrderStatus", chefAuth, async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ msg: "No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hotelDb = getHotelDb(decoded.hotelName);
    const Order = hotelDb.model("Order", orderSchema);

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Get io instance and emit to specific room
    const io = req.app.get('io');
    io.to(`order_${orderId}`).emit('order_status_update', {
      orderId,
      status,
      updatedAt: new Date()
    });

    res.json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
