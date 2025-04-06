const http = require('http');
const app = require('./app');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads', 'food-images');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = http.createServer(app);
const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log('Server is running on port ' + port);
});