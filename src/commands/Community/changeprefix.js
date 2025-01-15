const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

module.exports = {
    name: 'changeprefix',
    description: 'Change the bot prefix to a new one.',
    async execute(message, args, client) {
        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setTitle('ChangePrefix Command Help')
                .setDescription('This command allows you to change the bot prefix.')
                .addFields(
                    { name: 'Options', value: '`<New prefix>` - Provide the new prefix you want to set.' },
                    { name: 'Usage Examples', value: `\`${process.env.PREFIX}changeprefix !\`\n\`${process.env.PREFIX}changeprefix ?\`\n\`${process.env.PREFIX}changeprefix $\`` }
                )
                .setColor(0x00aaff);

            return message.channel.send({ embeds: [embed] });
        }

        const newPrefix = args[0];

        fs.writeFileSync('.env', `TOKEN=${process.env.TOKEN}\nPREFIX=${newPrefix}`);

        process.env.PREFIX = newPrefix;

        message.channel.send(`Prefix successfully changed to \`${newPrefix}\`.`);
    }
};