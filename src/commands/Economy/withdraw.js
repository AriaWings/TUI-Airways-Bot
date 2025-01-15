
const Bank = require('../../models/Bank');
const User = require('../../models/User');

module.exports = {
  name: 'withdraw',
  description: 'Withdraw coins from your bank account to balance.',
  async execute(message, args) {
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      return message.reply('Please provide a valid amount of coins to withdraw.');
    }

    try {
      const userId = message.author.id;
      let bank = await Bank.findOne({ userId });

      if (!bank) {
        return message.reply('You do not have a bank account yet.');
      }

      if (amount > bank.balance) {
        return message.reply('Insufficient balance in your bank account.');
      }

      bank.balance -= amount;
      await bank.save();

      let user = await User.findOne({ userId });
      if (!user) {
        user = new User({ userId, coins: 0 });
      }

      user.coins += amount;
      await user.save();

      message.reply(`Successfully withdrew ${amount} coins from your bank account.`);
    } catch (error) {
      console.error('Error withdrawing coins:', error);
      message.reply('An error occurred while withdrawing coins.');
    }
  },
};