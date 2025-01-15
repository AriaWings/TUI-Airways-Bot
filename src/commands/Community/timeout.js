const { Client, Message, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');

const cooldowns = new Map();

module.exports = {
    name: 'timeout',
    description: 'Timeout a specific user for a certain amount of time.',
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
            const cooldownAmount = 3 * 1000; // 3 seconds in milliseconds

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

            if (!args.length || args[0].toLowerCase() === 'help') {
                // Help embed
                const helpEmbed = new EmbedBuilder()
                    .setColor('#337fd5')
                    .setTitle(`Command: ${prefix}timeout`)
                    .setDescription('**Description:** Timeout a member so they cannot type.\n**Cooldown:** 3 seconds\n' +
                                    `**Usage:**\n${prefix}timeout [user] [limit] [reason]\n**Example:**\n${prefix}timeout @SkyDev 10 Shitposting\n${prefix}timeout User 10m spamming\n${prefix}timeout discreetsleet 1d Too Cool\n${prefix}timeout discreetsleet 5h He asked for it`);

                return message.channel.send({ embeds: [helpEmbed] });
            }

            const targetUser = message.mentions.members.first();
            const duration = args[1];
            const reason = args.slice(2).join(' ');
            const timeoutRoleId = '1325869164891734119'; // Replace with your timeout role ID

            if (!targetUser) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#f04a47')
                    .setDescription('<:dynoError:1326926743650435166> Please mention a user to timeout.');
                return message.channel.send({ embeds: [errorEmbed] });
            }

            if (!duration || !ms(duration)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#f04a47')
                    .setDescription('<:dynoError:1326926743650435166> Please provide a valid duration.');
                return message.channel.send({ embeds: [errorEmbed] });
            }

            const msDuration = ms(duration);
            if (msDuration < 5000 || msDuration > 2.31e9) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#f04a47')
                    .setDescription('<:dynoError:1326926743650435166> Timeout duration cannot be less than 5 seconds or more than 28 days.');
                return message.channel.send({ embeds: [errorEmbed] });
            }

            const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
            const requestUserRolePosition = message.member.roles.highest.position; // Highest role of the user who requested the timeout
            const botRolePosition = message.guild.members.me.roles.highest.position; // Highest role of the bot

            if (targetUserRolePosition >= requestUserRolePosition) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#f04a47')
                    .setDescription('<:dynoError:1326926743650435166> You cannot timeout a user with a role equal to or higher than yours.');
                return message.channel.send({ embeds: [errorEmbed] });
            }

            if (targetUserRolePosition >= botRolePosition) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#f04a47')
                    .setDescription('<:dynoError:1326926743650435166> I cannot timeout a user with a role equal to or higher than mine.');
                return message.channel.send({ embeds: [errorEmbed] });
            }

            // Timeout the user and add the timeout role
            try {
                const { default: prettyMs } = await import('pretty-ms');

                await targetUser.timeout(msDuration, reason);
                await targetUser.roles.add(timeoutRoleId);

                const successEmbed = new EmbedBuilder()
                    .setColor('#43b582')
                    .setDescription(`***<:dynoSuccess:1326926745584013362> ${targetUser.user.tag} has been timed out.***`);
                message.channel.send({ embeds: [successEmbed] });

                // Log the command usage
                const logChannelId = '1326433442467938324'; // Replace with your log channel ID
                const logChannel = message.guild.channels.cache.get(logChannelId);

                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#337fd5')
                        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                        .setDescription(`Used \`timeout\` command in ${message.channel}\n${prefix}timeout ${targetUser.user.tag}${reason ? ` ${reason}` : ''}`)
                        .setTimestamp();

                    logChannel.send({ embeds: [logEmbed] });
                }

                // Remove the timeout role after the duration ends
                setTimeout(async () => {
                    if (targetUser.isCommunicationDisabled()) {
                        await targetUser.roles.remove(timeoutRoleId);
                    }
                }, msDuration);
            } catch (error) {
                console.log(`There was an error when timing out: ${error}`);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#f04a47')
                    .setDescription('<:dynoError:1326926743650435166> There was an error executing this command.');

                if (error.code === 50013) {
                    errorEmbed.setDescription('<:dynoError:1326926743650435166> I do not have permission to timeout this user. Please verify that I have the `MANAGE_MEMBERS` permission.');
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