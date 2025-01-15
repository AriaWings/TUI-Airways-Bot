const { joinVoiceChannel } = require('@discordjs/voice');
const { ActivityType } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('Bot is logged in!');

        const channelId = '1326186862959919165';
        const statusArray = [
            { content: 'Air France PTFS!', type: ActivityType.Watching },
            { content: 'Server Management!', type: ActivityType.Playing },
            { content: 'to .gg/pJdgnJ5WmE !', type: ActivityType.Listening },
        ];

        try {
            const channel = await client.channels.fetch(channelId);

            if (channel && channel.isVoiceBased()) {
                joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                });

                console.log(`Bot successfully joined voice channel: ${channel.name}`);
            } else {
                console.error('Voice channel not found or not valid.');
            }
        } catch (error) {
            console.error('Error fetching or joining voice channel:', error);
        }

        let currentPrefix = process.env.PREFIX;

        setInterval(async () => {
        const newPrefix = process.env.PREFIX;
        if (newPrefix !== currentPrefix) {
        currentPrefix = newPrefix;
        client.guilds.cache.forEach(async (guild) => {
            try {
                await guild.members.me.setNickname(`${currentPrefix} | ${client.user.username}`);
            } catch (error) {
                console.error(`Error setting nickname in guild ${guild.name}:`, error);
            }
        });
        console.log(`Prefix updated to: ${currentPrefix}`);
        }
        }, 1000);

        setInterval(() => {
            const option = Math.floor(Math.random() * statusArray.length);
            client.user.setPresence({
                activities: [
                    {
                        name: statusArray[option].content,
                        type: statusArray[option].type,
                    },
                ],
            });
        }, 1500);
    },
}
