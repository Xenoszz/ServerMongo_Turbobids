const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
    car_brand: String,
    car_model: String,
    car_rear: String,
    car_color: String,
    car_status: String,
    car_details: String,
    car_year: Number,
    car_price: Number,
    odometer: Number,
    primary_damage: String,
    cylinders: Number,
    transmission: String,
    drive: String,
    fuel: String,
    car_rating: { type: Number, default: 0 },
    auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction' },
    bidding: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },

});

module.exports = mongoose.model('Car', carSchema);