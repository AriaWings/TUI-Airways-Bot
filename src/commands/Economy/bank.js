const { EmbedBuilder } = require('discord.js');
const Bank = require('../../models/Bank');

module.exports = {
  name: 'bank',
  description: 'View your bank account details.',
  async execute(message, args) {
    try {
      const userId = message.author.id;
      let bank = await Bank.findOne({ userId });

      if (!bank) {
        bank = await Bank.create({ userId, accountNumber: generateAccountNumber(), balance: 0 });
      }
const userAvatarURL = message.author.displayAvatarURL({ dynamic: true, format: 'png' });
      const embed = new EmbedBuilder()
        .setTitle(`Bank Account Details`)
        .setColor('#3498db')
        .setDescription(`**:briefcase: Account Number:**\n> **${bank.accountNumber}**\n\n**<:draco_credit:1250693267285082112> Bank Balance:**\n> **${bank.balance} coins**`)
      	.setThumbnail(userAvatarURL);

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching bank details:', error);
      message.reply('An error occurred while fetching your bank details.');
    }
  },
};


function generateAccountNumber() {
  return Math.random().toString(36).substr(2, 9);
}