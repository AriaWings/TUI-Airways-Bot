
const Bank = require('../../models/Bank');
const User = require('../../models/User');

module.exports = {
  name: 'deposit',
  description: 'Deposit coins from your balance to bank account.',
  async execute(message, args) {
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      return message.reply('Please provide a valid amount of coins to deposit.');
    }

    try {
      const userId = message.author.id;
      let bank = await Bank.findOne({ userId });

      if (!bank) {
        return message.reply('You do not have a bank account yet.');
      }

      let user = await User.findOne({ userId });

      if (!user) {
        return message.reply('User not found.');
      }

      if (amount > user.coins) {
        return message.reply('Insufficient balance.');
      }

      bank.balance += amount;
      await bank.save();

      user.coins -= amount;
      await user.save();

      message.reply(`Successfully deposited ${amount} coins to your bank account.`);
    } catch (error) {
      console.error('Error depositing coins:', error);
      message.reply('An error occurred while depositing coins.');
    }
  },
};
