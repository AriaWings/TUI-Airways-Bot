const { EmbedBuilder, Permissions } = require('discord.js');
const fs = require('fs');
const path = require('path');

const loaRoleID = '1325870809956356128';
const loaDataPath = path.join(__dirname, 'loaData.json');

let loaData = {};
if (fs.existsSync(loaDataPath)) {
    loaData = JSON.parse(fs.readFileSync(loaDataPath, 'utf-8'));
}

module.exports = {
    name: 'purgeloa',
    description: 'Purge all LOA data and remove the LOA role from all users.',
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Purging LOA Data')
            .setDescription('Removing the LOA role and tag from all users in LOA and deleting their data...')
            .setTimestamp();

        const purgeMessage = await message.channel.send({ embeds: [embed] });

        const currentTime = Date.now();
        const guild = message.guild;

        for (const userID in loaData) {
            try {
                const member = await guild.members.fetch(userID);
                if (loaData[userID].expires <= currentTime) {
                    await member.roles.remove(loaRoleID);
                    await member.setNickname(loaData[userID].originalNickname);
                    delete loaData[userID];
                }
            } catch (error) {
                console.error('Error while purging LOA data for user:', userID, error);
            }
        }

        fs.writeFileSync(loaDataPath, JSON.stringify(loaData, null, 4));
        embed.setDescription('All LOA data has been purged, and the LOA role has been removed from all users.');
        purgeMessage.edit({ embeds: [embed] });
    }
};
