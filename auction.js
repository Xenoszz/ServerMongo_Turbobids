const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema({
    car_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
    bids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bid' }],
    auction_start_date: Date,
    auction_end_date: Date,
    auction_start_time: String, 
    auction_end_time: String,   
    auction_status: String,
    auction_starting_price: Number,
    auction_minimum_price: Number,
    auction_current_price: Number,

  });
  
  module.exports = mongoose.model('Auction', auctionSchema);