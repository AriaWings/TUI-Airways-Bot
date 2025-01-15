const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'timeoutlogs',
    description: 'Displays a list of all users who are or were timed out, including their timeout details.',
    
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.channel.send('You need the `Manage Messages` permission to use this command.');
        }

        const auditLogs = await message.guild.fetchAuditLogs({ type: 24, limit: 100 });
        const timeoutLogs = auditLogs.entries.filter(entry => 
            entry.changes.some(change => change.key === 'communication_disabled_until')
        );

        if (timeoutLogs.size === 0) {
            return message.channel.send('No timeout logs found in this server.');
        }

        const usersData = [];
        for (const [id, entry] of timeoutLogs) {
            const { target, changes, createdAt } = entry;
            const timeoutChange = changes.find(change => change.key === 'communication_disabled_until');
            const timeoutEndTime = new Date(timeoutChange.new);
            const active = timeoutEndTime > Date.now();

            const timeLeft = active 
                ? getTimeLeft(timeoutEndTime)
                : `${Math.round((Date.now() - timeoutEndTime) / 1000 / 60)} minutes ago`;

            usersData.push({
                username: target.tag,
                userId: target.id,
                timeoutTime: createdAt.toLocaleString(),
                reason: entry.reason || 'Not provided',
                active,
                timeoutEndTime,
                timeLeft
            });
        }

        const pageSize = 5;
        const pages = Math.ceil(usersData.length / pageSize);
        let currentPage = 0;

        const generateEmbed = (page) => {
            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle(`Timeout Logs (${usersData.length} users found)`)
                .setFooter({ text: `Page ${page + 1} of ${pages}` })
                .setTimestamp();

            const startIndex = page * pageSize;
            const endIndex = startIndex + pageSize;
            const usersOnPage = usersData.slice(startIndex, endIndex);

            usersOnPage.forEach((user, index) => {
                embed.addFields(
                    { name: `${index + 1}. ${user.username} (${user.userId})`, value: `**Timeout Time**: ${user.timeoutTime}\n**Reason**: ${user.reason}\n**Active**: ${user.active ? 'Yes' : 'No'}\n**Timeout Ends In**: ${user.timeLeft}`, inline: false }
                );
                embed.addFields({ name: '-----------------', value: '\u200B', inline: false });
            });
            return embed;
        };

        const createPaginationButtons = (disabled = false) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('first')
                    .setLabel('⏪ First')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disabled || currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('◀️ Prev')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disabled || currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next ▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disabled || currentPage === pages - 1),
                new ButtonBuilder()
                    .setCustomId('last')
                    .setLabel('Last ⏩')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disabled || currentPage === pages - 1)
            );
        };

        const sendEmbeds = async () => {
            let embeds = [];
            for (let i = 0; i < pages; i++) {
                const embed = generateEmbed(i);
                embeds.push(embed);
            }

            const initialMessage = await message.channel.send({
                embeds: embeds.slice(0, 1), // Send first embed
                components: [createPaginationButtons()]
            });

            const collector = initialMessage.createMessageComponentCollector({
                filter: (interaction) => interaction.user.id === message.author.id,
                time: 60000
            });

            collector.on('collect', (interaction) => {
                if (interaction.customId === 'first') currentPage = 0;
                if (interaction.customId === 'prev' && currentPage > 0) currentPage--;
                if (interaction.customId === 'next' && currentPage < pages - 1) currentPage++;
                if (interaction.customId === 'last') currentPage = pages - 1;

                interaction.update({
                    embeds: [embeds[currentPage]],
                    components: [createPaginationButtons()]
                });
            });

            collector.on('end', () => {
                initialMessage.edit({
                    components: [createPaginationButtons(true)]
                });
            });
        };

        sendEmbeds();
    }
};

function getTimeLeft(timeoutEndTime) {
    const diff = timeoutEndTime - Date.now();
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    let timeLeft = '';
    if (days > 0) timeLeft += `${days} day${days > 1 ? 's' : ''} `;
    if (hours > 0) timeLeft += `${hours} hour${hours > 1 ? 's' : ''} `;
    if (minutes > 0) timeLeft += `${minutes} minute${minutes > 1 ? 's' : ''}`;

    return timeLeft || 'Less than a minute';
}