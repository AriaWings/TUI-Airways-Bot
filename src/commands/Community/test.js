module.exports = {
    name: 'test',
    description: 'This is the test command!',
    async execute(message, args, client) {
        await message.channel.send('The bot is working!');
    }
};