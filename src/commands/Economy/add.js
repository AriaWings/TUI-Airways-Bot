const { ownerIds, logChannelId } = require('../../../config');
const User = require('../../models/User');

module.exports = {
  name: 'add',
  description: 'Add coins to a user',
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
        user = new User({ userId: userId, coins: 0 });
      }

      user.coins += amount;
      await user.save();

      message.reply(`${amount} coins added to user ${userId}. New balance: ${user.coins} coins.`);

      const logChannel = await message.client.channels.fetch(logChannelId);
      logChannel.send(`${amount} coins added to user ${userId} by ${message.author.username}. New balance: ${user.coins} coins.`);
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while adding coins to the user.');
    }
  },
};
