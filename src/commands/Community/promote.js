const { Client, Message, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
require('dotenv').config(); // Ensure environment variables are loaded

const cooldowns = new Map();

module.exports = {
    name: 'promotion',
    description: 'Log a promotion.',
    permissionsRequired: [PermissionFlagsBits.ManageRoles],
    botPermissions: [PermissionFlagsBits.ManageRoles],

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

            if (args.length < 5) {
                const helpEmbed = new EmbedBuilder()
                    .setColor('#f04a47')
                    .setTitle(`Command: ${prefix}promotion`)
                    .setDescription('**Description:** Log a promotion.\n**Cooldown:** 4 seconds\n' +
                                    `**Usage:**\n${prefix}promotion @User OldRank NewRank Reason @ApprovedBy\n**Example:**\n${prefix}promotion @NoobLance Member Moderator Excellent performance @Admin`);

                return message.channel.send({ embeds: [helpEmbed] });
            }

            const targetUser = message.mentions.members.first();
            const oldRank = args[1];
            const newRank = args[2];
            const reason = args.slice(3, -1).join(' ');
            const approvedBy = message.mentions.members.last();

            if (!targetUser || !approvedBy) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#f04a47')
                    .setDescription('<:dynoError:1326926743650435166> Please mention the user to be promoted and the user who approved the promotion.');
                return message.channel.send({ embeds: [errorEmbed] });
            }

            const promotionEmbed = new EmbedBuilder()
                .setColor('#43b582')
                .setTitle('Promotion Log')
                .addFields(
                    { name: 'Promoter:', value: `${message.author}`, inline: true },
                    { name: 'User:', value: `${targetUser}`, inline: true },
                    { name: 'Old Rank:', value: oldRank, inline: true },
                    { name: 'New Rank:', value: newRank, inline: true },
                    { name: 'Reason:', value: reason, inline: true },
                    { name: 'Approved by:', value: `${approvedBy}`, inline: true }
                )
                .setTimestamp();

            return message.channel.send({ content: `${targetUser}`, embeds: [promotionEmbed] });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#f04a47')
                .setDescription('<:dynoError:1326926743650435166> There was an error executing this command.');
            return message.channel.send({ embeds: [errorEmbed] });
        }
    }
};