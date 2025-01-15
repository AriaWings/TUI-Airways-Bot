const mongoose = require('mongoose');

const coinRewardSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  coinsPerInvite: { type: Number, required: true }, 
});

module.exports = mongoose.model('CoinReward', coinRewardSchema);
