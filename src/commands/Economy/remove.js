const { ownerIds, logChannelId } = require('../../../config');
const User = require('../../models/User');

module.exports = {
  name: 'remove',
  description: 'Remove coins from a user',
  async execute(message, args) {
    if (!ownerIds.includes(message.author.id)) return message.reply('You are not authorized to use this command.');

    const amount = parseInt(args[0]);
    const userId = args[1];
    if (isNaN(amount) || amount <= 0 || !userId) {
      return message.reply('Please provide a valid amount of coins and a user ID.');
    }

    try {
      let user = await User.findOne({ userId: userId });
      if (!user) {
        return message.reply('User not found.');
      }

      user.coins -= amount;
      if (user.coins < 0) user.coins = 0;
      await user.save();

      message.reply(`${amount} coins removed from user ${userId}. New balance: ${user.coins} coins.`);

      const logChannel = await message.client.channels.fetch(logChannelId);
      logChannel.send(`${amount} coins removed from user ${userId} by ${message.author.username}. New balance: ${user.coins} coins.`);
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while removing coins from the user.');
    }
  },
};