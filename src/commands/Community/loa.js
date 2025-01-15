const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const cooldowns = new Set();
const intervalDelay = 5000;
let interval;
let loaData = {};
const loaDataPath = path.join(__dirname, 'loaData.json');
if (fs.existsSync(loaDataPath)) {
    try {
        loaData = JSON.parse(fs.readFileSync(loaDataPath, 'utf-8'));
    } catch (error) {
        console.error("Error reading or parsing loaData.json:", error);
    }
}

module.exports = {
    name: 'loa',
    description: 'Put a user on Leave of Absence (LOA).',
    async execute(message, args) {
        if (cooldowns.has(message.author.id)) {
            return message.channel.send('You are on cooldown! Please wait 4 seconds before using this command again.');
        }

        if (!args.length) {
            const helpEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('Help Guide: Leave of Absence Command')
                .setDescription('This command allows staff members to put a user on Leave of Absence (LOA).')
                .addFields(
                    { name: 'Arguments', value: '**user:** Mention the user to be put on LOA.\n**rank:** The rank of the user (string).\n**duration:** Duration of LOA in the format `<number><unit>` where unit can be:\n- `d`: Days\n- `h`: Hours\n- `w`: Weeks\n- `m`: Months\n**reason:** (Optional) Reason for the LOA.' },
                    { name: 'Usage Examples', value: '`!loa @User Sergeant 2w Vacation`\n`!loa @SkyCaptain Officer 3d Personal`\n`!loa @John Doe Private 1m Training`' }
                )
                .setFooter({ text: 'LOA Manager', iconURL: message.author.displayAvatarURL() });

            return message.channel.send({ embeds: [helpEmbed] });
        }

        if (!message.member.permissions.has('ManageRoles')) return message.channel.send('You need the `Manage Roles` permission to use this command.');

        const user = message.mentions.users.first();
        if (!user) return message.channel.send('You must mention a user to put on LOA.');

        const rank = args[1];
        if (!rank) return message.channel.send('You must specify the rank of the user.');

        const durationArg = args[2];
        if (!durationArg || !/^\d+[dhmwt]$/.test(durationArg)) return message.channel.send('You must provide a valid duration (e.g., `2w`, `3d`, `1m`).');

        const reason = args.slice(3).join(' ') || 'No reason provided';
        const durationMap = { 'd': 86400, 'h': 3600, 'w': 604800, 'm': 2592000, 't': 60 };
        const unit = durationArg.slice(-1);
        const amount = parseInt(durationArg.slice(0, -1));
        const durationInSeconds = amount * durationMap[unit];
        const durationDisplay = `${amount} ${unit === 'd' ? 'Days' : unit === 'h' ? 'Hours' : unit === 'w' ? 'Weeks' : unit === 'm' ? 'Months' : 'Minutes'}`;

        const member = await message.guild.members.fetch(user.id);
        const loaRoleID = '1325870809956356128';
        const logChannelID = '1326433442467938324';
        const hasLoaRole = member.roles.cache.has(loaRoleID);
        const hasLoaTag = member.displayName.includes('(LOA)');

        if (loaData[user.id]) {
            return message.channel.send(`<@${user.id}> is already on LOA.`);
        }

        if (hasLoaRole || hasLoaTag) {
            if (!hasLoaRole) {
                await member.roles.add(loaRoleID);
            }

            if (!hasLoaTag) {
                await member.setNickname(`(LOA) ${member.displayName}`);
            }

            loaData[user.id] = { 
                userTag: user.tag,
                rank,
                reason,
                duration: durationDisplay,
                timestamp: Date.now(),
                expires: Date.now() + durationInSeconds * 1000
            };

            try {
                fs.writeFileSync(loaDataPath, JSON.stringify(loaData, null, 4));
            } catch (error) {
                console.error('Error writing to loaData.json:', error);
                return message.channel.send('There was an issue saving the data. Please try again later.');
            }

            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setTitle('**Leave of Absence Request**')
                .setDescription(`**Staff Member**\n\`User:\` <@${user.id}>\n\`ID:\` ${user.id}\n\`Rank:\` ${rank}\n-----------------------------------------\n**Leave of Absence Information**\n\`Reason:\` ${reason}\n\`Length:\` ${durationDisplay}`)
                .setFooter({ text: `Action performed by ${message.author.tag}` })
                .setTimestamp();

            const logChannel = await message.guild.channels.fetch(logChannelID);
            const logMessage = await logChannel.send({ embeds: [embed] });

            return message.channel.send(`User <@${user.id}> already had the LOA role or tag. Missing elements were added, and they are now tracked in the [LOA records](${logMessage.url}).`);
        }

        const originalNickname = member.displayName;

        try {
            await member.roles.add(loaRoleID);
            await member.setNickname(`(LOA) ${originalNickname}`);

            loaData[user.id] = {
                userTag: user.tag,
                rank,
                reason,
                duration: durationDisplay,
                timestamp: Date.now(),
                expires: Date.now() + durationInSeconds * 1000,
                originalNickname
            };

            try {
                fs.writeFileSync(loaDataPath, JSON.stringify(loaData, null, 4));
            } catch (error) {
                console.error('Error writing to loaData.json:', error);
                return message.channel.send('There was an issue saving the data. Please try again later.');
            }

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('**Leave of Absence Request**')
                .setDescription(`**Staff Member**\n\`User:\` <@${user.id}>\n\`ID:\` ${user.id}\n\`Rank:\` ${rank}\n-----------------------------------------\n**Leave of Absence Information**\n\`Reason:\` ${reason}\n\`Length:\` ${durationDisplay}`)
                .setFooter({ text: `Action performed by ${message.author.tag}` })
                .setTimestamp();

            const logChannel = await message.guild.channels.fetch(logChannelID);
            const logMessage = await logChannel.send({ embeds: [embed] });

            await message.channel.send(`Put <@${user.id}> on LOA for ${durationDisplay}, reason: ${reason}. Check [this log](${logMessage.url}) for more information.`);

            cooldowns.add(message.author.id);
            setTimeout(() => cooldowns.delete(message.author.id), 4000);

            if (!interval) {
                interval = setInterval(() => {
                    const now = Date.now();
            
                    for (const [userId, data] of Object.entries(loaData)) {
                        if (now >= data.expires) {
                            (async () => {
                                try {
                                    const guildMember = await message.guild.members.fetch(userId);
                                    if (guildMember) {
                                        await guildMember.roles.remove(loaRoleID);
            
                                        if (data.originalNickname) {
                                            await guildMember.setNickname(data.originalNickname);
                                        } else {
                                            await guildMember.setNickname(guildMember.user.username);
                                        }
                                    }
            
                                    delete loaData[userId];
            
                                    try {
                                        fs.writeFileSync(loaDataPath, JSON.stringify(loaData, null, 4));
                                    } catch (error) {
                                        console.error('Error writing to loaData.json during cleanup:', error);
                                    }
                                } catch (error) {
                                    console.error('Failed to remove LOA:', error);
                                }
                            })();
                        }
                    }
            
                    if (Object.keys(loaData).length === 0) {
                        clearInterval(interval);
                        interval = null;
                    }
                }, intervalDelay);            
            }
        } catch (error) {
            console.error('Error processing LOA command:', error);
            message.channel.send('Failed to process LOA request. Please check my permissions and try again.');
        }
    }
};