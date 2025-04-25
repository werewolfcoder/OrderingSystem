const express = require('express');
const router = express.Router();
const multer = require('multer');
const jwt = require("jsonwebtoken");
const path = require('path');
const QRCode = require("qrcode");
const fs = require('fs');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
// const Category = require('../../models/categoryModel');
// const Menu = require('../../models/menuModel');
const bcrypt = require("bcryptjs");
const adminAuth = require("../../middleware/adminAuth");
const { getHotelDb } = require("../../utils/dbSwitcher");
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/food-images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'food-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});


router.post('/addItem',adminAuth, upload.single('image'), [
  body('categoryId').notEmpty().withMessage('Category ID is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('price').notEmpty().withMessage('Price is required'),
  body('description').notEmpty().withMessage('Description is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Food image is required' });
    }

    const { categoryId, name, price, description } = req.body;
    
    // Verify if categoryId is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID format' });
    }

    const imageUrl = `/uploads/food-images/${req.file.filename}`;
    const hotelDb = getHotelDb(req.admin.hotelName);
        const Category = hotelDb.model("Category", require("../../models/categoryModel"));
        const Menu = hotelDb.model("Menu", require("../../models/menuModel"));
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const newItem = new Menu({
      category: categoryId,
      name,
      price: parseFloat(price),
      description,
      imageUrl
    });

    await newItem.save();
    res.status(201).json({
      message: 'Menu item added successfully',
      item: newItem 
    });

  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/deleteItem/:id', adminAuth,async (req, res) => {
    const { id } = req.params;
  
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid item ID.' });
    }
  
    try {
      // Find item in DB
      const hotelDb = getHotelDb(req.admin.hotelName);
        const Menu = hotelDb.model("Menu", require("../../models/menuModel"));
      const item = await Menu.findById(id);
      if (!item) {
        return res.status(404).json({ message: 'Menu item not found.' });
      }
  
      // Delete image file if exists
      if (item.imageUrl) {
        const imagePath = path.join(__dirname, '..', item.imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
  
      // Delete item from DB
      await Menu.findByIdAndDelete(id);
  
      res.status(200).json({ message: 'Menu item and image deleted successfully.' });
  
    } catch (error) {
      console.error('Error deleting menu item:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });

  router.put('/updateItem/:id',adminAuth, upload.single('image'), [
    body('name').notEmpty().withMessage('Name is required'),
    body('price').notEmpty().isNumeric().withMessage('Price must be a number'),
    body('description').notEmpty().withMessage('Description is required'),
    body('categoryId').notEmpty().isMongoId().withMessage('Valid category ID is required'),
  ], async (req, res) => {
    try {
      const hotelDb = getHotelDb(req.admin.hotelName);
        const Menu = hotelDb.model("Menu", require("../../models/menuModel"));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const itemId = req.params.id;
      const { name, price, description, categoryId } = req.body;
  
      const existingItem = await Menu.findById(itemId);
      if (!existingItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
  
      // Handle image replacement
      let imageUrl = existingItem.imageUrl;
      if (req.file) {
        // Delete old image
        if (imageUrl && fs.existsSync(path.join(__dirname, '..', imageUrl))) {
          fs.unlinkSync(path.join(__dirname, '..', imageUrl));
        }
        imageUrl = `/uploads/food-images/${req.file.filename}`;
      }
  
      // Update item
      existingItem.name = name;
      existingItem.price = parseFloat(price);
      existingItem.description = description;
      existingItem.category = categoryId;
      existingItem.imageUrl = imageUrl;
  
      await existingItem.save();
  
      res.status(200).json({
        message: 'Menu item updated successfully',
        item: existingItem
      });
  
    } catch (err) {
      console.error('Error updating item:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


router.get('/getItems',adminAuth, async (req, res) => {
    try {
      const hotelDb = getHotelDb(req.admin.hotelName);
        const Menu = hotelDb.model("Menu", require("../../models/menuModel"));
      const items = await Menu.find().populate('category', 'name'); // Populating category name
      res.status(200).json({ success: true, items });
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch items. Please try again later.' });
    }
  });

router.get('/getCategories',adminAuth, async (req, res) => {
    try {
      const hotelDb = getHotelDb(req.admin.hotelName);
        const Category = hotelDb.model("Category", require("../../models/categoryModel"));
      const categories = await Category.find();
      res.status(200).json({
        success: true,
        categories
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  router.post('/addCategory',adminAuth, [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { name } = req.body;
  
    try {
      // ✅ Check if category already exists
      const hotelDb = getHotelDb(req.admin.hotelName);
      const Category = hotelDb.model("Category", require("../../models/categoryModel"));
      const existing = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
      if (existing) {
        return res.status(409).json({ message: 'Category already exists' });
      }
  
      // ✅ Create and save category
      const newCategory = new Category({ name });
      await newCategory.save();
  
      res.status(201).json({
        message: 'Category created successfully',
        category: newCategory
      });
  
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.delete('/deleteCategory/:id',adminAuth, async (req, res) => {
    const categoryId = req.params.id;
  
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
  
    try {
      // Check if any menu item is using this category
      const hotelDb = getHotelDb(req.admin.hotelName);
        const Menu = hotelDb.model("Menu", require("../../models/menuModel"));
        const Category = hotelDb.model("Category", require("../../models/categoryModel"));
      const menuItems = await Menu.find({ category: categoryId });
  
      if (menuItems.length > 0) {
        return res.status(400).json({
          message: 'Cannot delete category. It is associated with existing menu items.',
        });
      }
  
      const deletedCategory = await Category.findByIdAndDelete(categoryId);
  
      if (!deletedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      res.status(200).json({
        message: 'Category deleted successfully',
        category: deletedCategory,
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  router.put('/updateCategory/:id',adminAuth,
    [
      body('name').trim().notEmpty().withMessage('Category name is required'),
    ],
    async (req, res) => {
      const categoryId = req.params.id;
  
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }
  
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { name } = req.body;
  
      try {

        const hotelDb = getHotelDb(req.admin.hotelName);
        const Category = hotelDb.model("Category", require("../../models/categoryModel"));

        const updatedCategory = await Category.findByIdAndUpdate(
          categoryId,
          { name },
          { new: true }
        );
  
        if (!updatedCategory) {
          return res.status(404).json({ message: 'Category not found' });
        }
  
        res.status(200).json({
          message: 'Category name updated successfully',
          category: updatedCategory,
        });
      } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  );
  

  router.post("/create-chef",adminAuth,
    [
      body("chefId").notEmpty(),
      body("password").isLength({ min: 4 }),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
      const { chefId, password } = req.body;
  
      try {
        const hotelDb = getHotelDb(req.admin.hotelName);
        const Chef = hotelDb.model("Chef", require("../../models/chefModel"));
  
        const exists = await Chef.findOne({ chefId });
        if (exists) return res.status(400).json({ msg: "Chef already exists." });
  
        const hashed = await bcrypt.hash(password, 10);
        const newChef = new Chef({ chefId, password: hashed });
  
        await newChef.save();
        res.status(201).json({ msg: "Chef created!" });
      } catch (err) {
        console.error("Chef creation failed:", err);
        res.status(500).json({ msg: "Server error" });
        res.status(500).json({msg:err});
      }
    }
  );


  router.get("/generate-qr", async (req, res) => {
    try {
      const { tableNumber } = req.query;
  
      if (!tableNumber) {
        return res.status(400).json({ msg: "Table number is required" });
      }
  
      // Assume you extract hotelName from admin's token (so it’s secure)
      const token = req.headers.authorization?.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const hotelName = decoded.hotelName;
  
      const qrUrl = `${process.env.FRONTEND_URL}scan?hotel=${hotelName}&table=${tableNumber}`;
      
      // Generate QR image as Data URL
      const qrImage = await QRCode.toDataURL(qrUrl);
  
      res.json({ qrImage, qrUrl }); // qrImage can be used as <img src="..." />
    } catch (err) {
      console.error("QR generation error:", err);
      res.status(500).json({ msg: "Failed to generate QR code" });
    }
  });

router.get("/getAllOrders", adminAuth, async (req, res) => {
  try {
    const hotelDb = getHotelDb(req.admin.hotelName);
    const Order = hotelDb.model("Order", require("../../models/orderModel"));

    const orders = await Order.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .select("-__v"); // Exclude version key

    res.json({ success: true, orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
