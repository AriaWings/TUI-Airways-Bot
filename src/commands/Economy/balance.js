const User = require('../../models/User');

module.exports = {
  name: 'balance',
  description: 'Check your balance',
  async execute(message, args) {
    try {
      const userId = message.author.id;
      let user = await User.findOne({ userId: userId });

      if (!user) {
        user = new User({ userId: userId, coins: 0 });
        await user.save();
      }

      message.reply(`You have ${user.coins} coins.`);
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while fetching your balance.');
    }
  },
};
