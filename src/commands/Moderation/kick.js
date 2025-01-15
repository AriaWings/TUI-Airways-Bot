const { Client, Message, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const cooldowns = new Map();

module.exports = {
    name: 'kick',
    description: 'Kick a specific user from the server.',

    /**
     * 
     * @param {Message} message
     * @param {string[]} args
     * @param {Client} client 
     */
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMembers)) {
            return message.channel.send('You do not have the required permissions to use this command. Please ensure you have the `MANAGE_MEMBERS` permission.');
        }

        try {
            const prefix = process.env.PREFIX || '!';
            const args = message.content.split(' ').slice(1); 
            if (args.length === 0) {
                return message.channel.send('You must mention a user to kick.');
            }

            const kickUser = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);
            if (!kickUser || kickUser === null) {
                return message.channel.send('The user mentioned is no longer within the server.');
            }

            const botMember = message.guild.members.cache.get(client.user.id);
            const botDisplayName = botMember.displayName;

            const reason = args.slice(1).join(' ') || 'No reason given';

            if (!message.guild.members.me.permissions.has(PermissionFlagsBits.kickUsers)) {
                return message.channel.send("I don't have permission to kick members. Please ensure I have the `KICK_MEMBERS` permission.");
            }

            if (kickUser.id === client.user.id) {
                return message.channel.send(`You cannot kick ${botDisplayName}!`);
            }

            if (!kickUser.kickable) {
                return message.channel.send("I can't kick this user! Their role or themselves are above me.");
            }
            if (message.author.id === kickUser.id) {
                return message.channel.send('You cannot kick yourself!');
            }

            if (kickUser.permissions.has(PermissionFlagsBits.Administrator)) {
                return message.channel.send('You cannot kick a person with admin permission.');
            }

            if (kickUser.id === message.guild.ownerId) {
                return message.channel.send('You cannot kick the server owner.');
            }

            try {
                await kickUser.kick(reason);
                const successEmbed = new EmbedBuilder()
                    .setColor('#43b581')
                    .setDescription(`***<:dynoSuccess:132692674117007872> Successfully kicked ${kickUser.user.tag}.***`);
                return message.channel.send({ embeds: [successEmbed] });
            } catch (error) {
                console.log(`There was an error when kicking out: ${error}.`);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#f04a47')
                    .setDescription('***<:dynoError:1326926743650435166> There was an error trying to kick the user.***');

                if (error.code === 50013) {
                    errorEmbed.setDescription('***<:dynoError:1326926743650435166> I do not have permission to kick this user. Please verify that I have the `KICK_MEMBERS` permission.***');
                } else if (error.code === `UND_ERR_CONNECT_TIMEOUT`) {
                    errorEmbed.setDescription('***<:dynoError:1326926743650435166> There was a connection timeout when trying to kick the user.***');
                }

                return message.channel.send({ embeds: [errorEmbed] });
            }
        } catch (error) {
            console.error('An error occurred:', error);
            return message.channel.send('An unexpected error occurred while trying to kick the user.');
        }
    }
};