const { ownerIds, prefix, logChannelId } = require('../../../config');
const Coupon = require('../../models/Coupon');
const { EmbedBuilder } = require('discord.js');

function generateCouponCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let couponCode = '';
  for (let i = 0; i < length; i++) {
    couponCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return couponCode;
}

module.exports = {
  name: 'drop',
  description: 'Drop a coupon in the channel',
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
      function getHex() {
  return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padEnd(6, '0');
}

      const embed = new EmbedBuilder()
        .setTitle('Coupon Drop!')
        // .setDescription(`A new coupon has been dropped!`)
        .addFields(
          { name: 'Coupon Code', value: couponCode },
          { name: 'Coins', value: coins.toString() },
          { name: 'Uses Limit', value: usesLimit.toString() },
          { name: 'How to redeem?', value: `\`${prefix}redeem ${couponCode}\`` }
        )
        .setColor(getHex())
        .setThumbnail(`https://i.imgur.com/uiErPSp.png`)
        .setTimestamp();

      message.channel.send({ content: '<@&1250762793695711273>', embeds: [embed] });

      const logChannel = await message.client.channels.fetch(logChannelId);
      logChannel.send(`Coupon dropped: ID: ${couponId}, Code: ${couponCode}, Coins: ${coins}, Uses Limit: ${usesLimit}. Dropped by ${message.author.username}.`);
    } catch (error) {
      console.error('Error generating coupon:', error);
      message.reply('An error occurred while generating the coupon.');
    }
  },
};