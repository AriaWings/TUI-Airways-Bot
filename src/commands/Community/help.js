const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { readdirSync } = require('fs');
const path = require('path');
require('dotenv').config();

module.exports = {
    name: 'help',
    description: 'Displays help information with pagination for available commands.',
    async execute(message, args, client) {
        try {
            const prefix = process.env.PREFIX;
            const categories = readdirSync(path.join(__dirname, '..')).filter(folder => folder !== 'info');
            const embeds = [];

            categories.forEach(category => {
                const commands = readdirSync(path.join(__dirname, '..', category)).filter(file => file.endsWith('.js'));
                if (commands.length > 0) {
                    const commandList = commands
                        .map(commandFile => {
                            const command = require(path.join(__dirname, '..', category, commandFile));
                            return `\`${prefix}${command.name}\` - ${command.description || 'No description provided.'}`;
                        })
                        .join('\n');

                    const embed = new EmbedBuilder()
                        .setColor('#F71D25')
                        .setTitle(`Help - ${category.charAt(0).toUpperCase() + category.slice(1)} Commands`)
                        .setDescription(commandList)
                        .setFooter({ text: `Page ${embeds.length + 1} of ${categories.length}` })
                        .setTimestamp();

                    embeds.push(embed);
                }
            });

            let currentPage = 0;
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('◀️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(embeds.length <= 1)
            );

            const messageEmbed = await message.channel.send({ embeds: [embeds[currentPage]], components: [row] });

            const filter = i => i.user.id === message.author.id;
            const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async interaction => {
                if (interaction.customId === 'prev') {
                    currentPage--;
                } else if (interaction.customId === 'next') {
                    currentPage++;
                }

                row.components[0].setDisabled(currentPage === 0);
                row.components[1].setDisabled(currentPage === embeds.length - 1);

                await interaction.update({ embeds: [embeds[currentPage]], components: [row] });
            });

            collector.on('end', () => {
                row.components.forEach(button => button.setDisabled(true));
                messageEmbed.edit({ components: [row] });
            });
        } catch (error) {
            console.error('Error in help command execution:', error);
            message.channel.send('There was an error processing your help request. Please try again later.');
        }
    }
};
