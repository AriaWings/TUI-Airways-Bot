

const mongoose = require('mongoose');

const BankSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  accountNumber: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
});

module.exports = mongoose.model('Bank', BankSchema);
