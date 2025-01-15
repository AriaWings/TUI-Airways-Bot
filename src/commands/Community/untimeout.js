const { Client, Message, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
require('dotenv').config(); // Ensure environment variables are loaded

const cooldowns = new Map();

module.exports = {
    name: 'untimeout',
    description: 'Remove the timeout from a specific user.',
    permissionsRequired: [PermissionFlagsBits.MuteMembers],
    botPermissions: [PermissionFlagsBits.MuteMembers],

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
            const cooldownAmount = 5 * 1000; // 5 seconds in milliseconds

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

            if (!args.length) {
                // Help embed
                const helpEmbed = new EmbedBuilder()
                    .setColor('#337fd5')
                    .setTitle(`Command: ${prefix}untimeout`)
                    .setDescription('**Description:** Untimeout a member.\n**Cooldown:** 5 seconds\n**Usage:**\n' +
                                    `**Usage:** ${prefix}untimeout [user] (optional reason)\n**Example:** ${prefix}untimeout @NoobLance Appealed`);

                return message.channel.send({ embeds: [helpEmbed] });
            }

            const targetUser = message.mentions.members.first();
            const reason = args.slice(1).join(' ');
            const timeoutRoleId = '1325869164891734119'; // Replace with your timeout role ID

            if (!targetUser) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#f04a47')
                    .setDescription('<:dynoError:1326926743650435166> Please mention a user to untimeout.');
                return message.channel.send({ embeds: [errorEmbed] });
            }

            const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
            const requestUserRolePosition = message.member.roles.highest.position; // Highest role of the user who requested the untimeout
            const botRolePosition = message.guild.members.me.roles.highest.position; // Highest role of the bot

            if (targetUserRolePosition >= requestUserRolePosition) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#f04a47')
                    .setDescription('<:dynoError:1326926743650435166> You cannot untimeout a user with a role equal to or higher than yours.');
                return message.channel.send({ embeds: [errorEmbed] });
            }

            if (targetUserRolePosition >= botRolePosition) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#f04a47')
                    .setDescription('<:dynoError:1326926743650435166> I cannot untimeout a user with a role equal to or higher than mine.');
                return message.channel.send({ embeds: [errorEmbed] });
            }

            // Remove the timeout from the user
            try {
                const timeoutRole = message.guild.roles.cache.get(timeoutRoleId);

                if (!timeoutRole) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#f04a47')
                        .setDescription('<:dynoError:1326926743650435166> Timeout role not found.');
                    return message.channel.send({ embeds: [errorEmbed] });
                }

                if (!targetUser.isCommunicationDisabled()) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#f04a47')
                        .setDescription(`<:dynoError:1326926743650435166> I can't unmute ${targetUser.user.tag}, they aren't muted.`);
                    return message.channel.send({ embeds: [errorEmbed] });
                }

                await targetUser.timeout(null, reason);
                await targetUser.roles.remove(timeoutRole);

                // Log the command usage
                const logChannelId = '1326433442467938324'; // Replace with your log channel ID
                const logChannel = message.guild.channels.cache.get(logChannelId);

                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#337fd5')
                        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                        .setDescription(`Used \`untimeout\` command in ${message.channel}\n${prefix}untimeout ${targetUser.user.tag}${reason ? ` ${reason}` : ''}`)
                        .setTimestamp();

                    logChannel.send({ embeds: [logEmbed] });
                }

                // Send success message
                const successEmbed = new EmbedBuilder()
                    .setColor('#43b582')
                    .setDescription(`***<:dynoSuccess:1326926745584013362> ${targetUser.user.tag} was unmuted.***`);

                return message.channel.send({ embeds: [successEmbed] });
            } catch (error) {
                console.log(`There was an error when removing the timeout: ${error}`);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#f04a47')
                    .setDescription('<:dynoError:1326926743650435166> There was an error executing this command.');

                if (error.code === 50013) {
                    errorEmbed.setDescription('<:dynoError:1326926743650435166> I do not have permission to untimeout this user. Please verify I have the `MANAGE_MEMBERS` permission.');
                } else if (error.code === 'UND_ERR_CONNECT_TIMEOUT') {
                    errorEmbed.setDescription('<:dynoError:1326926743650435166> Connection timeout error. Please try again later.');
                }

                return message.channel.send({ embeds: [errorEmbed] });
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