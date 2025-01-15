const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('punish')
        .setDescription('Punish a staff member.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to punish.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('rank')
                .setDescription('The rank of the punished user.'))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the punishment.'))
        .addStringOption(option =>
            option.setName('result')
                .setDescription('The result of the punishment.')
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
            option.setName('appealable')
                .setDescription('If the punishment is appealable or not.')
                .addChoices(
                    { name: "Yes", value: "Yes" },
                    { name: "No", value: "No" }
                ))
        .addStringOption(option =>
            option.setName('notes')
                .setDescription('Notes.')),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const punishedUser = interaction.options.getUser('user');
        const punishedMember = await interaction.guild.members.fetch(punishedUser.id);
        const rank = interaction.options.getString('rank') || 'No rank specified';
        const reason = interaction.options.getString('reason') || 'No reason given';
        const result = interaction.options.getString('result') || 'No result given';
        const appealable = interaction.options.getString('appealable');
        const notes = interaction.options.getString('notes') || 'No notes provided';
        const logChannelId = '1285517020800090214'; // Log channel ID
        const logChannel = interaction.guild.channels.cache.get(logChannelId);

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return await interaction.editReply({ content: 'You must have the moderate members permission to use this command.', ephemeral: true });
        }

        if (!punishedMember) {
            return await interaction.editReply({ content: 'The user mentioned is no longer in the server.', ephemeral: true });
        }

        if (!punishedMember.kickable) {
            return await interaction.editReply({ content: "I cannot punish this user! Their role or themselves are above me.", ephemeral: true });
        }

        if (interaction.member.id === punishedMember.id) {
            return await interaction.editReply({ content: 'You cannot punish yourself!', ephemeral: true });
        }

        if (punishedMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.editReply({ content: 'You cannot punish a person with admin permission.', ephemeral: true });
        }

        // Strike, Warning, and Termination role IDs
        const strikeRoles = {
            'Strike 1': '1288716266000879630',  // Replace with the actual role ID for Strike 1
            'Strike 2': '1289084350406856756',  // Replace with the actual role ID for Strike 2
            'Strike 3': '1288717479790645331',  // Replace with the actual role ID for Strike 3
            'Strike 4': '1288717943835857017',  // Replace with the actual role ID for Strike 4
            'Strike 5': '1288732081219833866',  // Replace with the actual role ID for Strike 5
            'Warning': '1288718499623206943',   // Replace with the actual role ID for Warning
            'Termination': '1288718918340444279'// Replace with the actual role ID for Termination
        };

        // Remove any previous strike, warning, or termination roles
        const allRoles = Object.keys(strikeRoles);
        for (const roleKey of allRoles) {
            const roleId = strikeRoles[roleKey];
            if (punishedMember.roles.cache.has(roleId)) {
                try {
                    await punishedMember.roles.remove(roleId);
                } catch (error) {
                    console.error(`Error removing role ${roleKey}:`, error);
                }
            }
        }

        // Add the new strike, warning, or termination role if applicable
        if (strikeRoles[result]) {
            const newRoleId = strikeRoles[result];
            try {
                await punishedMember.roles.add(newRoleId);
            } catch (error) {
                console.error('Error adding role:', error);
                return await interaction.editReply({ content: 'Failed to add the role to the user. Please check the role permissions.', ephemeral: true });
            }
        }

        // Create the embed message for punishment
        const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Staff Punishment Announcement")
        .setDescription(`-------------------------------------------------\n
                         **Staff Member**\n
                         \`User:\` ${punishedUser.tag}\n
                         \`User ID:\` ${punishedUser.id}\n
                         \`Rank:\` ${rank}\n
                         -------------------------------------------------\n
                         **Punishment**\n
                         \`Reason:\` ${reason}\n
                         \`Result:\` ${result}\n
                         \`Appealable:\` ${appealable}\n
                         \`Notes:\` ${notes}\n
                         -------------------------------------------------\n
                         *Signed by ${interaction.user.tag}*`)
            .setFooter({ text: `Action performed by ${interaction.user.tag}` }) // Footer added correctly
            .setTimestamp(); // Timestamp at the end        
        
             // Send the punishment log and ping the user
        const logMessage = await logChannel.send({
            content: `<@${punishedUser.id}>`, // Ping the punished user
            embeds: [embed]
        });

        // Send a response to the interaction
        await interaction.editReply({
            content: `${punishedUser.tag} has been punished with ${result}. Check [this punishment log](${logMessage.url}) for more information.`,
            ephemeral: true // Makes the message visible only to the command executor
        });
    }
};
