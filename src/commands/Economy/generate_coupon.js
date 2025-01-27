const { ownerIds, logChannelId } = require('../../../config');
const Coupon = require('../../models/Coupon');

function generateCouponCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let couponCode = '';
  for (let i = 0; i < length; i++) {
    couponCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return couponCode;
}

module.exports = {
  name: 'generate_coupon',
  description: 'Generate a coupon',
  async execute(message, args) {
    if (!ownerIds.includes(message.author.id)) {
      return message.reply('You are not authorized to use this command.');
    }

    const coins = parseInt(args[0]);
    const usesLimit = parseInt(args[1]);
    if (isNaN(coins) || isNaN(usesLimit) || coins <= 0 || usesLimit <= 0) {
      return message.reply('Please provide valid coins and uses limit.');
    }

    try {
      const couponCode = generateCouponCode(8);
      const couponId = generateCouponCode(12);

      const coupon = new Coupon({
        code: couponCode,
        coins: coins,
        usesLimit: usesLimit,
        uses: 0,
        redeemedBy: [],
        couponId: couponId
      });
      await coupon.save();

      for (const ownerId of ownerIds) {
        try {
          const owner = await message.client.users.fetch(ownerId);
          await owner.send(`Coupon generated by ${message.author.username}: ID: ${couponId}, Code: ${couponCode}, Coins: ${coins}, Uses Limit: ${usesLimit}`);
        } catch (dmError) {
          console.error(`Failed to send DM to owner ${ownerId}:`, dmError);
          message.reply(`Failed to send DM to owner with ID ${ownerId}.`);
        }
      }

      message.reply('Coupon generated successfully!');

      const logChannel = await message.client.channels.fetch(logChannelId);
      logChannel.send(`Coupon generated: ID: ${couponId}, Code: ${couponCode}, Coins: ${coins}, Uses Limit: ${usesLimit}. Generated by ${message.author.username}.`);
    } catch (error) {
      console.error('Error generating coupon:', error);
      message.reply('An error occurred while generating the coupon.');
    }
  },
};