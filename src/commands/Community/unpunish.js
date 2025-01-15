const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unpunish')
        .setDescription('Remove a punishment from a staff member.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to unpunish.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('rank')
                .setDescription('The rank of the unpunished user.'))
        .addStringOption(option =>
            option.setName('punishment')
                .setDescription('The punishment to remove.')
                .addChoices(
                    { name: "Strike 1", value: "Strike 1" },
                    { name: "Strike 2", value: "Strike 2" },
                    { name: "Strike 3", value: "Strike 3" },
                    { name: "Strike 4", value: "Strike 4" },
                    { name: "Strike 5", value: "Strike 5" },
                    { name: "Warning", value: "Warning" },
                    { name: "Termination", value: "Termination" }
                ))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for unpunishment.'))
        .addStringOption(option =>
            option.setName('notes')
                .setDescription('Any additional notes.')),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const unpunishedUser = interaction.options.getUser('user');
        const unpunishedMember = await interaction.guild.members.fetch(unpunishedUser.id);
        const rank = interaction.options.getString('rank') || 'No rank specified';
        const punishment = interaction.options.getString('punishment') || 'No punishment specified';
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const notes = interaction.options.getString('notes') || 'No notes provided';
        const logChannelId = '1285517020800090214'; // Replace with the correct log channel ID
        const logChannel = interaction.guild.channels.cache.get(logChannelId);

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return await interaction.editReply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        if (!unpunishedMember) {
            return await interaction.editReply({ content: 'The user mentioned is no longer in the server.', ephemeral: true });
        }

        // Strike, Warning, and Termination role IDs
        const punishmentRoles = {
            'Strike 1': '1288716266000879630',  // Replace with the actual role ID for Strike 1
            'Strike 2': '1289084350406856756',  // Replace with the actual role ID for Strike 2
            'Strike 3': '1288717479790645331',  // Replace with the actual role ID for Strike 3
            'Strike 4': '1288717943835857017',  // Replace with the actual role ID for Strike 4
            'Strike 5': '1288732081219833866',  // Replace with the actual role ID for Strike 5
            'Warning': '1288718499623206943',   // Replace with the actual role ID for Warning
            'Termination': '1288718918340444279'// Replace with the actual role ID for Termination
        };

        const roleId = punishmentRoles[punishment];
        if (!roleId) {
            return await interaction.editReply({ content: 'Invalid punishment selected.', ephemeral: true });
        }

        if (!unpunishedMember.roles.cache.has(roleId)) {
            return await interaction.editReply({ content: `${unpunishedUser.tag} does not have the ${punishment} role.`, ephemeral: true });
        }

        try {
            // Remove the punishment role
            await unpunishedMember.roles.remove(roleId);

            // Create the unpunishment embed
            const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Staff Unpunishment Announcement')
            .setDescription(`-------------------------------------------------\n
                             **Staff Member**\n
                             \`User:\` ${unpunishedUser.tag}\n
                             \`User ID:\` ${unpunishedUser.id}\n
                             \`Rank:\` ${rank}\n
                             -------------------------------------------------\n
                             **Unpunishment Details**\n
                             \`Punishment Removed:\` ${punishment}\n
                             \`Reason:\` ${reason}\n
                             \`Notes:\` ${notes}\n
                             -------------------------------------------------\n
                             *Signed by ${interaction.user.tag}*`)
            .setFooter({ text: `Action performed by ${interaction.user.tag}` }) // Footer added correctly
            .setTimestamp(); // Timestamp at the end        

            // Send the log to the log channel and ping the unpunished user
            const logMessage = await logChannel.send({
                content: `<@${unpunishedUser.id}>`, // Ping the unpunished user
                embeds: [embed]
            });

            // Send a reply with a link to the punishment log
            await interaction.editReply({
                content: `${unpunishedUser.tag}'s punishment has been removed. Check [this unpunishment log](${logMessage.url}) for more information.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error removing punishment role:', error);
            await interaction.editReply({ content: 'There was an error removing the punishment role.', ephemeral: true });
        }
    }
};
