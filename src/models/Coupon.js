const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  coins: { type: Number, required: true },
  usesLimit: { type: Number, required: true },
  uses: { type: Number, default: 0 },
  redeemedBy: { type: [String], default: [] },
  couponId: { type: String, required: true, unique: true } 
});

module.exports = mongoose.model('Coupon', couponSchema);
