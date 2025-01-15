const { ButtonBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User'); 

const ITEMS_PER_PAGE = 10;

module.exports = {
  name: 'leaderboard',
  description: 'View the leaderboard.',
  async execute(message, args) {
    try {
      
      const users = await User.find({ coins: { $gt: 0 } }).sort({ coins: -1 });

      if (!users || users.length === 0) {
        return message.reply('No users found with coins greater than 0.');
      }

      const userId = message.author.id;

      const userIndex = users.findIndex(user => user.userId === userId);
      const userRank = userIndex !== -1 ? userIndex + 1 : 'N/A';

      const pageCount = Math.ceil(users.length / ITEMS_PER_PAGE);

      const currentPage = userIndex !== -1 ? Math.floor(userIndex / ITEMS_PER_PAGE) + 1 : 1;

      const embed = generateLeaderboardEmbed(users, currentPage, pageCount, userRank);

      const msg = await message.channel.send({ embeds: [embed], components: [generateButtons(currentPage, pageCount)] });

      const filter = interaction => interaction.user.id === message.author.id;
      const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async interaction => {
        try {
          let newPage = currentPage;

      
          if (interaction.customId === 'prevButton' && currentPage > 1) {
            newPage--;
          } else if (interaction.customId === 'nextButton' && currentPage < pageCount) {
            newPage++;
          }

      
          const newEmbed = generateLeaderboardEmbed(users, newPage, pageCount, userRank);
          await interaction.update({ embeds: [newEmbed], components: [generateButtons(newPage, pageCount)] });

      
          currentPage = newPage;
        } catch (error) {
          console.error('Error handling interaction:', error);
        }
      });

      collector.on('end', () => {
        msg.edit({ components: [] }).catch(error => console.error('Failed to clear buttons:', error));
      });

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      message.reply('An error occurred while fetching or displaying the leaderboard.');
    }
  },
};

function generateLeaderboardEmbed(users, currentPage, pageCount, userRank) {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageUsers = users.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const embed = new EmbedBuilder()
    .setTitle('DracoManager Leaderboard')
    .setColor('#00FF00');

  let description = `Your Rank: ${userRank}\n\n`;

  pageUsers.forEach((user, index) => {
    const rank = startIndex + index + 1;
    const member = user.userId;

    if (member) {
      description += `${rank}. <@${member}> - ${user.coins} coins\n`;
    } else {
      description += `${rank}. *Unknown User* - ${user.coins} coins\n`;
    }
  });

  embed.setDescription(description);

  return embed;
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