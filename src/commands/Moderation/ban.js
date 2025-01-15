const { Client, Message, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Ban a specific user from the server.',

    /**
     * 
     * @param {Message} message
     * @param {string[]} args
     * @param {Client} client 
     */
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.channel.send('You do not have the required permissions to use this command. Please ensure you have the `BAN_MEMBERS` permission.');
        }

        try {
            const prefix = process.env.PREFIX || '!';
            const args = message.content.split(' ').slice(1); 
            if (args.length === 0) {
                return message.reply(`Usage: ${prefix}ban <user> <reason>`);
            }

            const targetUser = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
            if (!targetUser) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#f04a47')
                    .setDescription('<:dynoError:1326926743650435166> The user mentioned does not exist or is no longer within the guild.');
                return message.channel.send({ embeds: [errorEmbed] });
            }

            const botMember = message.guild.members.cache.get(client.user.id);
            const botDisplayName = botMember.displayName;

            const reason = args.slice(1).join(' ') || 'No reason provided.';

            if (!message.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
                return message.channel.send("I don't have permission to ban members. Please ensure I have the `BAN_MEMBERS` permission.");
            }

            if (targetMember.id === client.user.id) {
                return message.channel.send(`You cannot ban ${botDisplayName}!`);
            }

            if (targetMember.permissions.has(PermissionFlagsBits.Administrator)) {
                return message.channel.send('You cannot ban a person with admin permission.');
            }

            const banRoleID = "1325453163083468880";
            const hasBanRole = targetMember.roles.cache.has(banRoleID);

            if (hasBanRole) {
                return message.channel.send(`You can't ban ${targetUser.tag} as they are a part of the Council Board.`);
            }

            if (!targetMember.bannable) {
                return message.channel.send("I can't ban this user! Their role or themselves are above me.");
            }
            if (message.author.id === targetMember.id) {
                return message.channel.send('You cannot ban yourself!');
            }

            if (targetMember.id === message.guild.ownerId) {
                return message.channel.send('You cannot ban the server owner.');
            }

            try {
                await targetMember.ban({ reason });
                const successEmbed = new EmbedBuilder()
                    .setColor('#43b581')
                    .setDescription(`***<:dynoSuccess:132692674117007872> Successfully banned ${targetMember.user.tag}.***`);
                return message.channel.send({ embeds: [successEmbed] });
            } catch (error) {
                console.log(`There was an error when banning: ${error}.`);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#f04a47')
                    .setDescription('***<:dynoError:1326926743650435166> There was an error trying to ban the user.***');

                if (error.code === 50013) {
                    errorEmbed.setDescription('***<:dynoError:1326926743650435166> I do not have permission to ban this user. Please verify that I have the `BAN_MEMBERS` permission.***');
                } else if (error.code === `UND_ERR_CONNECT_TIMEOUT`) {
                    errorEmbed.setDescription('***<:dynoError:1326926743650435166> There was a connection timeout when trying to ban the user.***');
                }

                return message.channel.send({ embeds: [errorEmbed] });
            }
        } catch (error) {
            console.error('An error occurred:', error);
            return message.channel.send('An unexpected error occurred while trying to ban the user.');
        }
    }
};