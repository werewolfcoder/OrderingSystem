// routes/admin/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const Admin = require("../../models/adminModel");
const { getHotelDb } = require("../../utils/dbSwitcher");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Generate admin username (used for login)
const generateUsername = (hotelName, adminName) => {
  const hotel = hotelName.toLowerCase().replace(/\s+/g, "");
  const admin = adminName.toLowerCase().replace(/\s+/g, "");
  return `${hotel}_${admin}`;
};

// @route POST /admin/register
router.post(
  "/register",
  [
    body("hotelName").notEmpty().withMessage("Hotel name is required"),
    body("adminName").notEmpty().withMessage("Admin name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { hotelName, adminName, email, password } = req.body;
    const username = generateUsername(hotelName, adminName);

    try {
      // Check if email or username already exists
      const existing = await Admin.findOne({ $or: [{ email }, { username }] });
      if (existing) {
        return res.status(400).json({ msg: "Admin with email or username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newAdmin = new Admin({
        hotelName,
        adminName,
        email,
        username,
        password: hashedPassword,
        role: "admin"
      });
      await newAdmin.save();

      // Initialize hotel-specific DB (optional for future setup)
      const db = getHotelDb(hotelName);

      // Generate JWT token (auto login)
      const token = jwt.sign(
        {
          id: newAdmin._id,
          username: newAdmin.username,
          role: newAdmin.role,
          hotelName: newAdmin.hotelName
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        msg: "Hotel registered successfully!",
        token,
        admin: {
          hotelName,
          adminName,
          email,
          username
        }
      });
    } catch (err) {
      console.error("Admin registration failed:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// @route POST /admin/login
router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
      const admin = await Admin.findOne({ username });
      if (!admin) return res.status(404).json({ msg: "Invalid username or password" });

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(401).json({ msg: "Invalid username or password" });

      const token = jwt.sign(
        {
          id: admin._id,
          username: admin.username,
          role: admin.role,
          hotelName: admin.hotelName
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(200).json({
        msg: "Login successful",
        token,
        admin: {
          hotelName: admin.hotelName,
          adminName: admin.adminName,
          email: admin.email,
          username: admin.username
        }
      });
    } catch (err) {
      console.error("Login failed:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

router.get("/verify", async (req, res) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      return res.status(403).json({ msg: "Invalid token" });
    }

    res.json({ valid: true });
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
});

module.exports = router;
