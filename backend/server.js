const http = require('http');
const app = require('./app');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads', 'food-images');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Enable CORS for Express
app.use(cors({
  origin: ["http://localhost:5173", "https://v4knw1n1-5173.inc1.devtunnels.ms","https://ordering-system-peach.vercel.app/"],
  credentials: true
}));

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://v4knw1n1-5173.inc1.devtunnels.ms"],
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Make io accessible to routes
app.set('io', io);

io.on('connection', (socket) => {
  console.log('User connected');

  // Join order-specific room
  socket.on('join_order_room', (orderId) => {
    socket.join(`order_${orderId}`);
  });

  // Leave room on disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log('Server is running on port ' + port);
});
