const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('retirement')
        .setDescription('Retirement of a user.')
        .addUserOption(option => option.setName('user').setDescription('The user that is retiring.').setRequired(true))
        .addStringOption(option => 
            option.setName('rank')
                .setDescription("The retiring user's rank.")
                .addChoices(
                    { name: 'Leadership', value: 'retiredLeadership' },
                    { name: 'Moderation Staff', value: 'retiredModeration' },
                    { name: 'Roleplay Staff', value: 'retiredRoleplay' },
                    { name: 'Media Staff', value: 'retiredMedia' }
                ))
        .addStringOption(option => option.setName('notes').setDescription('Additional notes for the retirement.')),

    async execute(interaction) {
        const user = interaction.options.getUser('user'); // Getting the user that is retiring
        const rankValue = interaction.options.getString('rank'); // Getting the user's rank
        const notes = interaction.options.getString('notes') || 'No notes provided'; // Getting additional notes

        // Map of rank values to role IDs
        const roleMap = {
            'retiredLeadership': '1289157619113656330',
            'retiredModeration': '1289157730208059432',
            'retiredRoleplay': '1289157788336918600',
            'retiredMedia': '1289157846876819540'
        };

        // Get the role ID for the selected rank
        const roleId = roleMap[rankValue];

        // Convert rankValue to a displayable rank for the embed
        let rankDisplay;
        if (rankValue === 'retiredMedia') {
            rankDisplay = 'Media Staff';
        } else if (rankValue === 'retiredLeadership') {
            rankDisplay = 'Leadership Staff';
        } else if (rankValue === 'retiredModeration') {
            rankDisplay = 'Moderation Staff';
        } else if (rankValue === 'retiredRoleplay') {
            rankDisplay = 'Roleplay Staff';
        } else {
            rankDisplay = rankValue.replace('retired', '').replace('Staff', ' Staff');
        }

        // Create the embed message with user, rank, and notes
        const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle('**Retired Member**') // Setting the title in bold
        .setDescription(`-----------------------------------------\n
                         \`User:\` <@${user.id}> \n
                         \`ID:\` ${user.id} \n
                         \`Rank:\` ${rankDisplay} \n
                         -----------------------------------------\n
                         \`Message:\` We are sad to see you leave <@${user.id}>, we wish you good luck in the future. ${notes}`)
        .setFooter({ text: `Action performed by ${interaction.user.tag}` }) // Adding the footer
        .setTimestamp(); // Adding the timestamp
    

        // Channel ID where the embed should be sent
        const channelId = '1285517020800090214';
        const channel = interaction.client.channels.cache.get(channelId);

        // Add the staff role ID you want to ping
        const staffRoleId = '1285924351572443228';

        if (channel) {
            // Send the embed and capture the message sent
            const message = await channel.send({
                content: `<@&${staffRoleId}>`, // This will ping the staff role
                embeds: [embed],
            });

            // Assign the corresponding role to the user
            const member = await interaction.guild.members.fetch(user.id);
            if (roleId) {
                await member.roles.add(roleId).catch(err => {
                    console.error('Failed to add role:', err);
                });
            }

            // Construct the message link for the embed
            const messageLink = `[Check the retirement log for more information](${message.url})`;

            // Custom interaction reply with the correct format
            await interaction.reply({
                content: `<@${user.id}> has retired from *${rankDisplay}*. ${messageLink}.`,
                ephemeral: true, // This message is only visible to the command user
            });
        } else {
            await interaction.reply({ content: 'Channel not found!', ephemeral: true });
        }
    },
};
