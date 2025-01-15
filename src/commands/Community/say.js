module.exports = {
    name: 'say',
    description: 'Make the bot say something and optionally ping a role',
    async execute(message, args, client) {
        try {
            // Check if no arguments are provided or help is requested
            if (!args.length || args[0].toLowerCase() === 'help') {
                // Help embed
                const helpEmbed = {
                    color: 0x0099ff,
                    title: '**Say Command Help**',
                    description: `Make the bot send a custom message with optional role ping.`,
                    fields: [
                        {
                            name: '**Options**',
                            value: '`<message>`: The message content to send.\n`@Role`: (Optional) Mention a role to ping.',
                        },
                        {
                            name: '**Usage Examples**',
                            value: '`?say Hello World!` - Sends "Hello World!".\n`?say Hello @Role` - Sends "Hello" and pings the mentioned role.',
                        },
                    ],
                    footer: {
                        text: 'Use this command to easily make the bot say anything!',
                    },
                };
                return message.channel.send({ embeds: [helpEmbed] });
            }

            // Extract role mention
            const pingRole = message.mentions.roles.first();

            // Filter out the role mention from args
            const filteredArgs = args.filter(arg => !arg.startsWith('<@&'));
            const messageContent = filteredArgs.join(' ');

            // Construct the message content
            let content = messageContent;
            if (pingRole) {
                content = `${pingRole.toString()} ${messageContent}`;
            }

            // Send the message
            await message.channel.send({
                content,
                allowedMentions: {
                    roles: pingRole ? [pingRole.id] : [],
                },
            });
        } catch (error) {
            console.error(error);
            await message.channel.send('There was an error executing this command.');
        }
    },
};
