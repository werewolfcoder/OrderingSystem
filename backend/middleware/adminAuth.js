// middleware/adminAuth.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');

module.exports = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    
    if (!token) {
      return res.status(401).json({ msg: "Access denied. No token provided." });
    }

    // Remove 'Bearer ' prefix if present
    const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;

    const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      return res.status(403).json({ msg: "Invalid token." });
    }

    req.admin = {
      id: admin._id,
      hotelName: admin.hotelName,
      email: admin.email,
    };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    res.status(403).json({ msg: "Invalid or expired token." });
  }
};
