const { prefix, ownerIds } = require('../../../config');
const CombinedInvite = require('../../models/CombinedInvite');
const CoinReward = require('../../models/CoinReward');
const User = require('../../models/User');

module.exports = {
  name: 'inv_reward',
  description: 'Set rewards for inviting users.',
  async execute(message, args) {
    if (!ownerIds.includes(message.author.id)) {
      return message.reply('You are not authorized to use this command.');
    }

    if (args.length !== 1) {
      return message.reply(`Usage: \`${prefix}inv_reward <no of coins per inv/disable>\``);
    }

    const action = args[0].toLowerCase();

    if (action === 'disable') {
      try {
        await CoinReward.updateMany({}, { $unset: { coinsPerInvite: 1 } });
        return message.reply('Invite rewards disabled.');
      } catch (error) {
        console.error('Error disabling invite rewards:', error);
        return message.reply('Failed to disable invite rewards.');
      }
    }

    const coinsPerInvite = parseInt(action);
    if (isNaN(coinsPerInvite) || coinsPerInvite <= 0) {
      return message.reply('Please provide a valid number greater than 0 or "disable".');
    }

    try {
      await CoinReward.findOneAndUpdate(
        { guildId: message.guild.id },
        { coinsPerInvite: coinsPerInvite },
        { upsert: true }
      );

      return message.reply(`Invite rewards set to ${coinsPerInvite} coins per invite.`);
    } catch (error) {
      console.error('Error setting invite rewards:', error);
      return message.reply('Failed to set invite rewards.');
    }
  },
};