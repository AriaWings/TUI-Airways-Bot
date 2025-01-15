const { Client, Message, EmbedBuilder, Permissions, Embed } = require('discord.js');

module.exports = {
    name: 'role-remove',
    description: 'This command removes a specific role from a user.',

    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {Client} client 
     * @returns 
     */

    async execute(message, args, client) {

        const prefix = process.env.PREFIX || '$';
        if (!args.length || args[0].toLowerCase() === 'help') {
            // Help embed
            const helpEmbed = new EmbedBuilder()
                .setColor('#337fd5')
                .setTitle(`Command: ${prefix}role-add`)
                .setDescription('**Description:** Timeout a member so they cannot type.\n**Cooldown:** 3 seconds\n' +
                                `**Usage:**\n${prefix}timeout [user] [limit] [reason]\n**Example:**\n${prefix}timeout @SkyDev 10 Shitposting\n${prefix}timeout User 10m spamming\n${prefix}timeout discreetsleet 1d Too Cool\n${prefix}timeout discreetsleet 5h He asked for it`);
            return message.channel.send({ embeds: [helpEmbed] });
        }

        if (!message.member.permissions.has('ManageRoles')) {
            return message.channel.send('You do not have the required permissions to use this command.');
        }

        const user = message.mentions.users.first();
        if (!user) return message.channel.send('You must mention a user to remove a role from.');

        const roleMention = message.mentions.roles.first();
        if (!roleMention) return message.channel.send('You must specify a valid role to remove.');

        const role = message.guild.roles.cache.get(roleMention.id);
        if (!role) return message.channel.send('You must specify a valid role to remove.');

        const requestRolePosition = message.member.roles.highest.position;
        const botRolePosition = message.guild.members.me.roles.highest.position;

        if (role.position >= requestRolePosition) {
            const rankErrorEmbed = new EmbedBuilder()
                .setColor('#f04a47')
                .setDescription('<:dynoError:1326926743650435166> You cannot remove a role equal to or higher than yours.');
            return message.channel.send({ embeds: [rankErrorEmbed] });
        }

        if (role.position >= botRolePosition) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#f04a47')
                .setDescription('<:dynoError:1326926743650435166> That role is higher than me, please make sure I have permissions.');
            return message.channel.send({ embeds: [errorEmbed] });
        }

        const targetUser = message.mentions.members.first();
        try {
            await targetUser.roles.remove(role);
            const successEmbed = new EmbedBuilder()
                .setColor('#43b582')
                .setDescription(`***<:dynoSuccess:1326926745584013362> The ${role.name} role has been removed from ${targetUser.user.tag}.***`);
            message.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error(error);
            message.channel.send('There was an error trying to add the role.');
        }
    }
};
