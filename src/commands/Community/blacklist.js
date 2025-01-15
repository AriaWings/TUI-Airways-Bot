const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'blacklist',
    description: 'Blacklist a member from a specific team.',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.channel.send('You must have the moderate members permission to use this command.');
        }

        const timeUser = message.mentions.users.first();
        if (!timeUser) return message.channel.send('You must mention a user to blacklist.');

        const timeMember = await message.guild.members.fetch(timeUser.id).catch(() => null);
        if (!timeMember) return message.channel.send('The user mentioned is no longer within the server.');

        const duration = args[1];
        if (!duration || isNaN(duration) && duration !== 'permanent') {
            return message.channel.send('You must provide a valid duration in seconds or use "permanent".');
        }

        const team = args[2];
        const roleIDs = {
            'Management': '1326183694725283920',
            'Moderation Staff': '1326183694725283920',
            'Roleplay Staff': '1326183694725283920',
            'Media Staff': '1326183694725283920',
            'Server Staff': '1326183694725283920'
        };

        const roleID = roleIDs[team];
        if (!roleID) return message.channel.send('You must specify a valid team.');

        const reason = args.slice(3).join(' ') || 'No reason given';
        const role = message.guild.roles.cache.get(roleID);
        if (!role) return message.channel.send(`Failed to find the ${team} Blacklisted role.`);

        if (!timeMember.kickable) {
            return message.channel.send("I cannot blacklist this user! Their role or themselves are above me.");
        }

        if (message.author.id === timeMember.id) {
            return message.channel.send('You cannot blacklist yourself!');
        }

        if (timeMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.channel.send('You cannot blacklist a person with admin permission.');
        }

        await timeMember.roles.add(role);

        if (duration !== 'permanent') {
            setTimeout(async () => {
                const updatedMember = await message.guild.members.fetch(timeUser.id).catch(() => null);
                if (updatedMember) {
                    await updatedMember.roles.remove(role).catch(console.error);
                }
            }, parseInt(duration) * 1000);
        }

        const logChannel = message.guild.channels.cache.get('1326433442467938324');
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(`**Blacklisted Member**\n\`User:\` ${timeUser.tag}\n\`ID:\` ${timeUser.id}\n-----------------------------------------\n**Blacklist Information**\n\`Reason:\` ${reason}\n\`Team:\` ${team}\n\`Length:\` ${duration === 'permanent' ? 'Permanent' : `${duration} seconds`}`)
            .setFooter({ text: `Action performed by ${message.author.tag}` })
            .setTimestamp();

        const embedMessage = await logChannel.send({
            content: `<@${timeUser.id}>`,
            embeds: [embed]
        });

        message.channel.send(`${timeUser.tag} was blacklisted from the **${team} Team**, reason: ${reason}. Check [this blacklist log](${embedMessage.url}) for more information.`);
    }
};
