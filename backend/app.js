const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const express = require("express");
const app = express();
const connnectToDb = require("./db/db");
const adminRoutes = require("./routes/localRoutes/AdminRoutes");
const adminRegisterRoutes = require("./routes/globalRoutes/adminAuth");
const chefRoutes = require("./routes/localRoutes/chefRoutes");
const userRoutes = require("./routes/localRoutes/userRoutes");
connnectToDb();
app.use(cors());

app.use(express.json());

// Add Socket.IO middleware
app.use((req, res, next) => {
  req.io = app.get('io');
  next();
});

app.use('/admin', adminRoutes);
app.use('/chef',chefRoutes)
app.use('/global', adminRegisterRoutes);
app.use('/user', userRoutes);
module.exports = app;