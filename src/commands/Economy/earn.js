const { ownerIds, logChannelId } = require('../../../config');
const Coupon = require('../../models/Coupon');
const axios = require('axios');

function generateCouponCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let couponCode = '';
  for (let i = 0; i < length; i++) {
    couponCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return couponCode;
}

async function createSourcebinFile(content) {
  try {
    const response = await axios.post('https://sourceb.in/api/bins', {
      files: [
        {
          content: content
        }
      ]
    });
    return `https://sourceb.in/${response.data.key}`;
  } catch (error) {
    console.error('Error creating Sourcebin file:', error);
    throw new Error('Failed to create Sourcebin file');
  }
}

async function generateGPlink(url) {
  const apiToken = 'ea0b3214d609e6d3ab0c586e8e95c77f9a843812';
  try {
    const response = await axios.get(`https://api.gplinks.com/api?api=${apiToken}&url=${encodeURIComponent(url)}&format=text`);
    return response.data;
  } catch (error) {
    console.error('Error generating GPlink:', error);
    throw new Error('Failed to generate GPlink');
  }
}

module.exports = {
  name: 'earn',
  description: 'Earn coins.',
  async execute(message) {
    try {
      const couponCode = generateCouponCode(8);
      const couponId = generateCouponCode(12);

      const coupon = new Coupon({
        code: couponCode,
        coins: 1,
        usesLimit: 1,
        uses: 0,
        redeemedBy: [],
        couponId: couponId
      });
      await coupon.save();

      const sourcebinUrl = await createSourcebinFile(`Coupon Code: ${couponCode}`);
      const gplinkUrl = await generateGPlink(sourcebinUrl);

      message.channel.send(`**Earn Credits: ${gplinkUrl}**\n\nYou will earn **1 credit <:draco_credit:1250693267285082112>** for every link you complete. Please note that each link is only valid ONCE.`);

      const logChannel = await message.client.channels.fetch(logChannelId);
      logChannel.send(`Coupon generated: ID: ${couponId}, Code: ${couponCode}, Coins: 1, Uses Limit: 1. Generated by ${message.author.username}. Sourcebin URL: ${sourcebinUrl}, GPlink URL: ${gplinkUrl}`);
    } catch (error) {
      console.error('Error generating coupon:', error);
      message.reply('An error occurred while generating the coupon.');
    }
  }
};