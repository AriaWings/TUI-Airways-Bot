const Bank = require('../../models/Bank');
const { prefix } = require('../../../config.js');

module.exports = {
  name: 'transfer',
  description: 'Transfer coins to another bank account.',
  async execute(message, args) {
    const amount = parseInt(args[0]);
    const targetAccountNumber = args[1];

    if (isNaN(amount) || amount <= 0 || !targetAccountNumber) {
      return message.reply(`Usage: ${prefix}transfer <amount> <target account number>`);
    }

    try {
      const userId = message.author.id;
      const userBank = await Bank.findOne({ userId });

      if (!userBank) {
        return message.reply('You do not have a bank account yet.');
      }

      if (amount > userBank.balance) {
        return message.reply('Insufficient balance in your bank account.');
      }

      const targetBank = await Bank.findOne({ accountNumber: targetAccountNumber });

      if (!targetBank) {
        return message.reply('Target bank account not found.');
      }

      userBank.balance -= amount;
      targetBank.balance += amount;

      await userBank.save();
      await targetBank.save();

      message.reply(`Successfully transferred ${amount} coins to account number ${targetAccountNumber}.`);
    } catch (error) {
      console.error('Error transferring coins:', error);
      message.reply('An error occurred while transferring coins.');
    }
  },
};