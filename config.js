require('dotenv').config();

module.exports = {
  prefix: process.env.PREFIX,
  ownerIds: process.env.OWNER_IDS ? process.env.OWNER_IDS.split(',') : [],
  token: process.env.TOKEN,
  mongoURI: process.env.MONGODB_URL,
  logChannelId: process.env.logChannelId,
  bankLogChannelId: process.env.bankLogChannelId
};
