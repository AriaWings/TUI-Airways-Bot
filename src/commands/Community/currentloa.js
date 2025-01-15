const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'currentloa',
    description: 'Shows all users currently on LOA with details.',
    async execute(message) {
        const loaDataPath = path.join(__dirname, 'loaData.json');
        if (!fs.existsSync(loaDataPath)) {
            return message.channel.send('No users are currently on LOA.');
        }

        const loaData = JSON.parse(fs.readFileSync(loaDataPath, 'utf-8'));
        const loaUsers = Object.values(loaData);

        if (loaUsers.length === 0) {
            return message.channel.send('No users are currently on LOA.');
        }

        const usersPerPage = 5;
        const totalPages = Math.ceil(loaUsers.length / usersPerPage);
        let currentPage = 1;

        const createEmbed = (page) => {
            const start = (page - 1) * usersPerPage;
            const end = start + usersPerPage;
            const pageUsers = loaUsers.slice(start, end);

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('Current LOA Users')
                .setDescription(
                    pageUsers
                        .map(
                            (user, index) =>
                                `**#${start + index + 1}**\n` +
                                `**User:** ${user.userTag}\n` +
                                `**Rank:** ${user.rank}\n` +
                                `**Reason:** ${user.reason}\n` +
                                `**Duration:** ${user.duration}\n` +
                                `**Expires:** <t:${Math.floor(user.expires / 1000)}:R>`
                        )
                        .join('\n\n')
                )
                .setFooter({ text: `Page ${page} of ${totalPages}` });

            return embed;
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('prev').setLabel('⬅️ Previous').setStyle(ButtonStyle.Primary).setDisabled(currentPage === 1),
            new ButtonBuilder().setCustomId('next').setLabel('➡️ Next').setStyle(ButtonStyle.Primary).setDisabled(currentPage === totalPages)
        );

        const messageEmbed = await message.channel.send({ embeds: [createEmbed(currentPage)], components: [row] });

        const collector = messageEmbed.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: 'You cannot control this pagination.', ephemeral: true });
            }

            if (interaction.customId === 'prev' && currentPage > 1) {
                currentPage--;
            } else if (interaction.customId === 'next' && currentPage < totalPages) {
                currentPage++;
            }

            await interaction.update({
                embeds: [createEmbed(currentPage)],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev')
                            .setLabel('⬅️ Previous')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === 1),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('➡️ Next')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === totalPages)
                    )
                ]
            });
        });

        collector.on('end', () => {
            messageEmbed.edit({ components: [] });
        });
    }
};
