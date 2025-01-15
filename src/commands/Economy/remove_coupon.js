const Coupon = require('../../models/Coupon');
const { ownerIds, logChannelId } = require('../../../config');

module.exports = {
  name: 'remove_coupon',
  description: 'Remove a coupon from the database',
  async execute(message, args) {
    if (!ownerIds.includes(message.author.id)) {
      return message.reply('You are not authorized to use this command.');
    }

    const couponId = args[0];
    if (!couponId) {
      return message.reply('Please provide a coupon ID.');
    }

    try {
      const result = await Coupon.findOneAndDelete({ couponId });

      if (result) {
        message.reply(`Coupon with ID ${couponId} has been successfully removed.`);
      } else {
        message.reply(`No coupon found with ID ${couponId}.`);
      }

      const logChannel = await message.client.channels.fetch(logChannelId);
      logChannel.send(`Coupon with ID ${couponId} removed by ${message.author.username}.`);
    } catch (error) {
      console.error('Error removing coupon:', error);
      message.reply('An error occurred while removing the coupon.');
    }
  },
};