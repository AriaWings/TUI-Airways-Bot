const mongoose = require('mongoose');

const combinedSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  inviterId: { type: String, required: true },
  inviteeId: { type: String, required: true },
  usedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CombinedInvite', combinedSchema);
