const { Events } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        const prefix = process.env.PREFIX || '!';
        if (message.author.bot || !message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName);

        if (!command) return;

        try {
            await command.execute(message, args, client);
        } catch (error) {
            console.error(error);
            message.channel.send('There was an error executing this command.');
        }
    },
};