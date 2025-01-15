const { Client, Message, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const cooldowns = new Map();

module.exports = {
    name: 'ticket-inactive',
    description: 'Marks a ticket as inactive and sends a warning message.',
    permissionsRequired: [PermissionFlagsBits.ManageChannels],
    botPermissions: [PermissionFlagsBits.ManageChannels],

    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {Client} client 
     */
    async execute(message, args, client) {
        try {
            const prefix = process.env.PREFIX || '!';
            const now = Date.now();
            const cooldownAmount = 4 * 1000; // 4 seconds in milliseconds

            if (!cooldowns.has(message.author.id)) {
                cooldowns.set(message.author.id, now);
            } else {
                const expirationTime = cooldowns.get(message.author.id) + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    const cooldownEmbed = new EmbedBuilder()
                        .setColor('#f04a47')
                        .setDescription(`<:dynoError:1326926743650435166> Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${this.name}\` command.`);
                    return message.channel.send({ embeds: [cooldownEmbed] });
                }

                cooldowns.set(message.author.id, now);
            }

            if (args.length && args[0].toLowerCase() === 'help') {
                // Help embed
                const helpEmbed = new EmbedBuilder()
                    .setColor('#337fd5')
                    .setTitle(`Command: ${prefix}ticket-inactive`)
                    .setDescription('**Description:** Marks a ticket as inactive and sends a warning message.\n**Cooldown:** 4 seconds\n' +
                                    `**Usage:**\n${prefix}ticket-inactive\n**Example:**\n${prefix}ticket-inactive`);

                return message.channel.send({ embeds: [helpEmbed] });
            }

            const channel = message.channel;
            const guild = channel.guild;
            const member = message.member || guild.members.cache.get(message.author.id);

            const requiredRole = '1325842492444119100'; // Replace with the allowed Role ID
            const allowedCategoryId = '1322204238368997477'; // Replace with your allowed category ID

            // Check if the command is run in the allowed category
            if (channel.parentId !== allowedCategoryId) {
                const reply = 'This command can only be run in channels under the specified category.';
                await message.channel.send(reply);
                await message.delete(); // Delete the prefix command message
                return;
            }

            // Check if the member has the required role
            if (!member.roles.cache.has(requiredRole)) {
                const reply = 'You do not have permission to run this command.';
                await message.channel.send(reply);
                await message.delete(); // Delete the prefix command message
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle('<:Notification:1326959851162832979> | Inactivity Warning')
                .setDescription(
                    'This ticket has been inactive for some time. Please wrap up this ticket and state any final questions within 24 hours. Otherwise, this ticket will be closed.'
                )
                .setTimestamp();

            try {
                // Rename the channel
                await channel.edit({ name: '〔❌〕inactivity-warning' });

                // Send the inactivity warning message
                await channel.send({
                    content: '@everyone',
                    embeds: [embed],
                });

                const successMessage = 'The inactivity warning has been sent, and the channel has been renamed.';
                await message.delete(); // Delete the prefix command message
            } catch (error) {
                console.error('Error sending inactivity warning:', error);

                const errorMessage = 'An error occurred while sending the inactivity warning. Please try again.';
                await message.channel.send(errorMessage);
                await message.delete(); // Delete the prefix command message
            }
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#f04a47')
                .setDescription('<:dynoError:1326926743650435166> There was an error executing this command.');
            return message.channel.send({ embeds: [errorEmbed] });
        }
    }
};