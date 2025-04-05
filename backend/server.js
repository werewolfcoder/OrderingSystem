const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors'); // Import CORS
const foodRoutes = require('./routes/foodRoutes'); // Import the food routes
const adminRoutes = require('./routes/adminRoutes'); // Import the admin routes
const path = require('path'); // Import path module
const connectToDb = require('./db/db'); // Import the database connection function
const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public/images'))); // Serve static files

// Connect to MongoDB
mongoose
  .connect('mongodb://localhost:27017/orderingSystem', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));
connectToDb(); // Call the function to connect to the database
// Routes
app.use('/api', foodRoutes); // Use the food routes under the /api path
app.use('/api/admin', adminRoutes); // Use the admin routes under the /api/admin path

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});