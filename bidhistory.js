const mongoose = require("mongoose");

const bidHistorySchema = new mongoose.Schema({
    bid_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
    car_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
    UserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bid_amount: Number,
    bid_time: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('BidHistory', bidHistorySchema);