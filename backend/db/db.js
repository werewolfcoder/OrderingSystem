const mongoose = require('mongoose');
const dbString = process.env.DB_CONNECT || 'mongodb://localhost:27017/orderingSystem'; // Default to local MongoDB if not provided

function connectToDb() {
  mongoose
    .connect(dbString, {
    })
    .then(() => {
      console.log('Connected to the database');
    })
    .catch((err) => {
      console.error('Database connection error:', err);
    });
}

module.exports = connectToDb;