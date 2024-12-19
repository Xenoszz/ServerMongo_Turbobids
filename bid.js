const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
    car_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    current_bid: Number,
    bid_increment: Number,

  });
  
  module.exports = mongoose.model('Bid', bidSchema);