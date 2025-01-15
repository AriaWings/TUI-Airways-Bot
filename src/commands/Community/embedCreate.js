const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'embedcreate',
    description: 'Create a custom embed with various options',
    async execute(message, args, client) {
        try {
            if (!args.length || args[0].toLowerCase() === 'help') {
                // Help message
                const helpEmbed = new EmbedBuilder()
                    .setColor('#00AAFF')
                    .setTitle('EmbedCreate Command Help')
                    .setDescription('Create a custom embed with the following options:')
                    .addFields([
                        { name: 'Options', value: '`message:` The text outside the embed.\n`color:` Hex color code (e.g., #FF0000).\n`title:` Title of the embed.\n`description:` Description text of the embed.\n`author:` Author name.\n`authorIcon:` URL of the author\'s icon.\n`footer:` Footer text.\n`footerIcon:` URL of the footer icon.\n`image:` URL of an image to include.\n`thumbnail:` URL of a thumbnail to include.\n`@Role` Mention a role to ping.' },
                        { name: 'Usage Example', value: '`!embedcreate @Role color:#FF0000 title:Hello description:This is a test embed.`' }
                    ])
                    .setFooter({ text: 'Use this command to create professional-looking embeds easily!' });

                return message.channel.send({ embeds: [helpEmbed] });
            }

            // Extract role mention
            const pingRole = message.mentions.roles.first();

            // Filter out the role mention from args
            const filteredArgs = args.filter(arg => !arg.startsWith('<@&'));

            // Parse options from the filtered arguments
            const options = {
                message: null,
                color: '#FFFFFF', // Default color
                title: null,
                description: null,
                author: null,
                authorIcon: null,
                footer: null,
                footerIcon: null,
                image: null,
                thumbnail: null,
            };

            // Extract each option from the filtered arguments
            filteredArgs.forEach((arg, index) => {
                if (arg.startsWith('color:')) options.color = arg.split(':')[1];
                else if (arg.startsWith('title:')) options.title = arg.slice(6);
                else if (arg.startsWith('description:')) options.description = arg.slice(12);
                else if (arg.startsWith('author:')) options.author = arg.slice(7);
                else if (arg.startsWith('authorIcon:')) options.authorIcon = arg.slice(11);
                else if (arg.startsWith('footer:')) options.footer = arg.slice(7);
                else if (arg.startsWith('footerIcon:')) options.footerIcon = arg.slice(11);
                else if (arg.startsWith('image:')) options.image = arg.slice(6);
                else if (arg.startsWith('thumbnail:')) options.thumbnail = arg.slice(10);
                else if (index === 0) options.message = arg; // Assume the first argument is the message
            });

            // Create the embed
            const embed = new EmbedBuilder().setColor(options.color);

            if (options.title) embed.setTitle(options.title);
            if (options.description) embed.setDescription(options.description);
            if (options.author) embed.setAuthor({ name: options.author, iconURL: options.authorIcon || undefined });
            if (options.footer) embed.setFooter({ text: options.footer, iconURL: options.footerIcon || undefined });
            if (options.image) embed.setImage(options.image);
            if (options.thumbnail) embed.setThumbnail(options.thumbnail);

            // Construct the reply content
            const replyContent = pingRole ? `${pingRole.toString()} ${options.message || ''}`.trim() : options.message || '';

            // Send the message and embed
            await message.channel.send({
                content: replyContent || null,
                embeds: [embed],
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
