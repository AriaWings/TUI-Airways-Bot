const { ownerIds, logChannelId } = require('../../../config');
const Coupon = require('../../models/Coupon');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');

const ITEMS_PER_PAGE = 5;

module.exports = {
  name: 'list_coupons',
  description: 'List all coupons.',
  async execute(message, args) {
    if (!ownerIds.includes(message.author.id)) {
      return message.reply('You are not authorized to use this command.');
    }

    try {
      const coupons = await Coupon.find();

      if (coupons.length === 0) {
        return message.reply('There are no coupons available.');
      }

      const pageCount = Math.ceil(coupons.length / ITEMS_PER_PAGE);

      const embed = new EmbedBuilder()
        .setTitle(`Coupons List - Page 1/${pageCount}`)
        .setColor('#00FF00')
        .setTimestamp();

      let couponList = generatePageCouponList(coupons, 1);

      embed.setDescription(couponList);

      const msg = await message.author.send({ embeds: [embed], components: [generateButtons(1, pageCount)] });

      const filter = (interaction) => interaction.user.id === message.author.id;
      const collector = msg.createMessageComponentCollector({ filter, time: 60000 }); 

      let currentPage = 1;

      collector.on('collect', async (interaction) => {
        try {
          if (interaction.customId === 'prevButton' && currentPage > 1) {
            currentPage--;
          } else if (interaction.customId === 'nextButton' && currentPage < pageCount) {
            currentPage++;
          }

          couponList = generatePageCouponList(coupons, currentPage);

          embed.setTitle(`Coupons List - Page ${currentPage}/${pageCount}`)
            .setDescription(couponList);

          await interaction.update({ embeds: [embed], components: [generateButtons(currentPage, pageCount)] });
        } catch (error) {
          console.error('Error handling interaction:', error);
        }
      });

      collector.on('end', () => {
        msg.edit({ components: [] }).catch(error => console.error('Failed to clear buttons:', error));
      });

      message.reply(`Check your DMs for the list of coupons (total ${coupons.length} coupons, ${pageCount} pages).`);

      const logChannel = await message.client.channels.fetch(logChannelId);
      logChannel.send(`User ${message.author.username} requested the coupon list.`);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      message.reply('An error occurred while fetching or sending the coupons.');
    }
  },
};

function generatePageCouponList(coupons, page) {
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const pageCoupons = coupons.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  let couponList = '';

  pageCoupons.forEach(coupon => {
    const usesLeft = coupon.usesLimit - coupon.uses;
    couponList += `ID: ${coupon.couponId}\nCode: ${coupon.code}\nCoins: ${coupon.coins}\nTotal Uses Limit: ${coupon.usesLimit}\nUses Left: ${usesLeft}\n\n`;
  });

  return couponList;
}

function generateButtons(currentPage, pageCount) {
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('prevButton')
        .setLabel('Previous')
        .setStyle('1')
        .setDisabled(currentPage === 1), 
      new ButtonBuilder()
        .setCustomId('nextButton')
        .setLabel('Next')
        .setStyle('1')
        .setDisabled(currentPage === pageCount)
    );

  return row;
}