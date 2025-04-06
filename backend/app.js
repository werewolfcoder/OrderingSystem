const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const express = require("express");
const app = express();
const connnectToDb = require("./db/db");
const adminRoutes = require("./routes/adminRoutes");
connnectToDb();
app.use(cors());

app.use(express.json());

app.use('/admin', adminRoutes);

module.exports = app;