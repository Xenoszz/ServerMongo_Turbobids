const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    car_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
    status: { type: Boolean, default: true }, 
  });
  
  module.exports = mongoose.model('Favorite', favoriteSchema);