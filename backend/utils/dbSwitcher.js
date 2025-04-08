require('dotenv').config(); // Load .env
// const mongoose = require("mongoose");
// const connections = {};
// function getHotelDb(hotelName) {
//   if (connections[hotelName]) {return connections[hotelName];}
//   const baseUri = process.env.BASE_MONGO_URI;
//   const dbName = `orderingSystem_${hotelName}`;
//   const fullUri = `${baseUri}${dbName}`;
//   connections[hotelName] = mongoose.createConnection(fullUri);
//  return connections[hotelName];}
// module.exports = { getHotelDb };
const mongoose = require("mongoose");

const connections = {}; // cache to avoid reconnecting

function getHotelDb(hotelName) {
  if (connections[hotelName]) {
    return connections[hotelName];
  }

  const uri = `${process.env.BASE_MONGO_URI}/${hotelName}?retryWrites=true&w=majority&appName=orderingSystem`;
  const conn = mongoose.createConnection(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  connections[hotelName] = conn;
  return conn;
}

module.exports = getHotelDb;
