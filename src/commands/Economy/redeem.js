const Coupon = require('../../models/Coupon');
const User = require('../../models/User');
const { logChannelId } = require('../../../config');

module.exports = {
  name: 'redeem',
  description: 'Redeem a coupon',
  async execute(message, args) {
    const couponCode = args[0];
    if (!couponCode) return message.reply('Please provide a coupon code.');

    try {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (!coupon) return message.reply('Invalid coupon code.');

      if (coupon.redeemedBy.includes(message.author.id)) {
        return message.reply('You have already redeemed this coupon.');
      }

      if (coupon.uses >= coupon.usesLimit) {
        return message.reply('Coupon has been fully redeemed.');
      }

      let user = await User.findOne({ userId: message.author.id });
      if (!user) {
        user = new User({ userId: message.author.id, coins: 0 });
        await user.save();
      }

      user.coins += coupon.coins;
      await user.save();

      coupon.uses++;
      coupon.redeemedBy.push(message.author.id);
      await coupon.save();

      message.reply(`Coupon redeemed successfully! Your balance is now ${user.coins} coins.`);

      const logChannel = await message.client.channels.fetch(logChannelId);
      logChannel.send(`User ${message.author.username} (${message.author.id}) redeemed coupon ${couponCode}. New balance: ${user.coins} coins.`);
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while redeeming the coupon.');
    }
  },
};