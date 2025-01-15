const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

// Role IDs mapping
const roleIDs = {
    'Management': '1288112806612307980',
    'Moderation Staff': '1288115163106512897',
    'Roleplay Staff': '1288116109425508433',
    'Media Staff': '1286247921158717502',
    'Server Staff': '1288121951608504425'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unblacklist')
        .setDescription('Remove a blacklist from a member for a specific team.')
        .addUserOption(option => option.setName('user').setDescription('The user you want to unblacklist.').setRequired(true))
        .addStringOption(option => option.setName('team').setDescription('The specific team you want to remove blacklist from.').addChoices(
            { name: "Management", value: "Management" },
            { name: "Moderation Staff", value: "Moderation Staff" },
            { name: "Roleplay Staff", value: "Roleplay Staff" },
            { name: "Media Staff", value: "Media Staff" },
            { name: "Server Staff", value: "Server Staff" }
        ))
        .addStringOption(option => option.setName('reason').setDescription('The reason for removing the blacklist.')),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const timeUser = interaction.options.getUser('user');
        const timeMember = await interaction.guild.members.fetch(timeUser.id);
        const team = interaction.options.getString('team');
        const roleID = roleIDs[team]; // Get role ID from the mapping
        const role = interaction.guild.roles.cache.get(roleID);
        const reason = interaction.options.getString('reason') || 'No reason given';

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return await interaction.editReply({ content: 'You must have the moderate members permission to use this command.', ephemeral: true });
        }

        if (!timeMember) {
            return await interaction.editReply({ content: 'The user mentioned is no longer within the server.', ephemeral: true });
        }

        if (!role) {
            return await interaction.editReply({ content: `No role found for the ${team} blacklist. Please check the role ID.`, ephemeral: true });
        }

        if (!timeMember.roles.cache.has(role.id)) {
            return await interaction.editReply({ content: `${timeUser.tag} is not blacklisted for the ${team} team.`, ephemeral: true });
        }

        // Remove the blacklist role from the member
        await timeMember.roles.remove(role);

        const logChannel = interaction.guild.channels.cache.get('1285517020800090214');

        // Create the embed message for unblacklist action
        const embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`**Unblacklisted Member**\n
                            \`User:\` ${timeUser.tag} \n
                            \`User ID:\` ${timeUser.id} \n
                            -------------------------------------------------\n
                            **Unblacklist Information**\n
                            \`Reason:\` ${reason} \n
                            \`Team:\` ${team}`)
            .setFooter({ text: `Action performed by ${interaction.user.tag}` })
            .setTimestamp();

        // Send the embed to the log channel and ping the user
        const embedMessage = await logChannel.send({
            content: `<@${timeUser.id}>`, // Ping the unblacklisted user
            embeds: [embed]
        });

        // Respond in the interaction channel with confirmation
        await interaction.editReply({
            content: `${timeUser.tag} has been unblacklisted from the **${team} Team**, reason: ${reason} Check [this log](${embedMessage.url}) for more information.`,
            ephemeral: true
        });
    }
};
