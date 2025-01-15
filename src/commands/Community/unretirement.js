const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unretirement')
        .setDescription('Unretirement of a user.')
        .addUserOption(option => option.setName('user').setDescription('The user that is unretiring.').setRequired(true))
        .addStringOption(option => 
            option.setName('rank')
                .setDescription("The retired user's rank.")
                .addChoices(
                    { name: 'Leadership Team', value: 'retiredLeadership' },
                    { name: 'Moderation Staff', value: 'retiredModeration' },
                    { name: 'Roleplay Staff', value: 'retiredRoleplay' },
                    { name: 'Media Staff', value: 'retiredMedia' }
                ))
        .addStringOption(option => option.setName('reason').setDescription('Reason for unretirement.')),

    async execute(interaction) {
        const user = interaction.options.getUser('user'); // Getting the user that is unretiring
        const rankValue = interaction.options.getString('rank'); // Getting the user's retired rank
        const reason = interaction.options.getString('reason') || 'No reason provided'; // Getting the reason for unretirement

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

        // Create the embed message with user, retired rank, and reason
        const embed = new EmbedBuilder()
        .setColor("Green")
        .setDescription(`**Unretired Member**\n
                        \`User:\` <@${user.id}> \n
                        \`ID:\` ${user.id} \n
                        \`Reason:\` ${reason} \n
                        \`Retired Rank:\` ${rankDisplay} \n
                        -----------------------------------------\n
                        \`Message:\` We are happy to welcome back <@${user.id}> to ${rankDisplay}!`)
        .setFooter({ text: `Action performed by ${interaction.user.tag}` }) // Footer added correctly
        .setTimestamp(); // Corrected the syntax here
    

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

            // Assign the corresponding role back to the user
            const member = await interaction.guild.members.fetch(user.id);
            if (roleId) {
                await member.roles.remove(roleId).catch(err => {
                    console.error('Failed to remove retired role:', err);
                });
            }

            // Construct the message link for the embed
            const messageLink = `[Check the unretirement log for more information](${message.url})`;

            // Custom interaction reply with the correct format
            await interaction.reply({
                content: `<@${user.id}> has unretired from *${rankDisplay}*. ${messageLink}.`,
                ephemeral: true, // This message is only visible to the command user
            });
        } else {
            await interaction.reply({ content: 'Channel not found!', ephemeral: true });
        }
    },
};
