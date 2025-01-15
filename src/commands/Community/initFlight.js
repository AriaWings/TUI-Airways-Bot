const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'hostflight',
    description: 'Provides information about an upcoming flight for TUI Airways PTFS',
    async execute(message, args, client) {
        try {
            // Ensure correct number of arguments
            if (args.length < 9) {
                const usageEmbed = new EmbedBuilder()
                    .setColor('#7289da')
                    .setTitle('Usage: ?hostflight Command Guide')
                    .setDescription('The **?hostflight** command provides information about an upcoming flight. Below is a breakdown of the fields you need to provide:')
                    .addFields(
                        { name: 'departureTimestamp', value: 'The departure time of the flight (UNIX timestamp).' },
                        { name: 'arrivalTimestamp', value: 'The arrival time of the flight (UNIX timestamp).' },
                        { name: 'aircraft', value: 'The aircraft model for the flight (e.g., Boeing 737).' },
                        { name: 'gate', value: 'The gate number where the flight will depart.' },
                        { name: 'flightNumber', value: 'The flight number (e.g., TUI123).' },
                        { name: 'departureAirport', value: 'The airport from which the flight is departing.' },
                        { name: 'arrivalAirport', value: 'The airport where the flight is arriving.' },
                        { name: 'roleID', value: 'The role ID to ping for flight notifications.' },
                        { name: 'link', value: 'Optional: A link to an image/banner for the flight.' }
                    )
                    .addFields(
                        { name: 'Example:', value: `\`?hostflight 1672565400 1672576200 Boeing 737 B12 TUI123 Heathrow JFK <roleID> https://example.com/flightimage.png\`` }
                    )
                    .setFooter({ text: 'Please make sure you enter all fields correctly.' })
                    .setTimestamp();

                return message.channel.send({ embeds: [usageEmbed] });
            }

            // Parse arguments
            const [departureTimestamp, arrivalTimestamp, aircraft, gate, flightNumber, dep, arr, roleID, link] = args;

            // Fetch the role by ID
            let role;
            try {
                role = await message.guild.roles.fetch(roleID);
                if (!role) throw new Error("Role not found.");
            } catch (error) {
                return message.channel.send('Invalid role ID.');
            }

            // Emojis
            const reactEmoji = "<:greenstatus:1324072180824281118>";
            const evtemoji = "<:greenstatus:1324072180824281118>";
            const departureemoji = "<:greenstatus:1324072180824281118>";
            const arrivalemoji = "<:greenstatus:1324072180824281118>";
            const aircraftemoji = "<:greenstatus:1324072180824281118>";
            const gateemoji = "<:greenstatus:1324072180824281118>";
            const flightnumberemoji = "<:greenstatus:1324072180824281118>";
            const durationemoji = "<:greenstatus:1324072180824281118>";
            const host = message.member.displayName; // User's display name as host
            const userId = message.author.id; // User's ID

            // Format timestamps and calculate duration
            const depTimestampFormat = `<t:${departureTimestamp}:T>`;
            const arrTimestampFormat = `<t:${arrivalTimestamp}:T>`;
            const durationMinutes = Math.floor((parseInt(arrivalTimestamp) - parseInt(departureTimestamp)) / 60);
            const duration = durationMinutes > 59 
                ? `${Math.floor(durationMinutes / 60)} Hours and ${durationMinutes % 60} Minutes`
                : `${durationMinutes} Minutes`;

            // Build the embed
            const embed = new EmbedBuilder()
                .setColor('#7289da')
                .setTitle(`${evtemoji} UPCOMING FLIGHT ${evtemoji}`)
                .addFields(
                    { name: `${departureemoji} Departure Time`, value: depTimestampFormat },
                    { name: `${arrivalemoji} Arrival Time`, value: arrTimestampFormat },
                    { name: `${departureemoji} Departure Airport`, value: dep },
                    { name: `${arrivalemoji} Arrival Airport`, value: arr },
                    { name: `${aircraftemoji} Aircraft`, value: aircraft },
                    { name: `${gateemoji} Gate`, value: gate },
                    { name: `${flightnumberemoji} Flight Number`, value: flightNumber },
                    { name: `${durationemoji} Flight Duration`, value: duration }
                )
                .setFooter({ text: `Command executed by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            // Set image for the embed if a link is provided
            let flightImage = null;
            if (link) {
                flightImage = link; // Directly set the image link
            }

            // Attach the photo at the bottom of the embed using setImage
            if (flightImage) {
                embed.setImage(flightImage); // Attach the image using setImage
            }

            // Send the flight information to the main channel
            const mainChannel = await message.client.channels.fetch('1322187244487835680'); // Replace with your main channel ID
            if (!mainChannel) throw new Error("Main channel not found");

            const flightMessage = await mainChannel.send({
                content: `<@&${role.id}>`, // Ping the specified role
                embeds: [
                    new EmbedBuilder()
                        .setColor('#7289da') // Set the sidebar to blue
                        .setTitle('Greetings Passengers!')
                        .setDescription(`Check out this flight to **${arr}** departing at **${depTimestampFormat}**, flown by *${host}*. See you there!`),
                    embed
                ],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('attending')
                            .setLabel('I am attending!')
                            .setStyle(ButtonStyle.Primary), // Primary button
                        new ButtonBuilder()
                            .setCustomId('not_attending')
                            .setLabel('I am not attending!')
                            .setStyle(ButtonStyle.Secondary) // Secondary button
                    )
                ]
            });

            // React with the specified emoji
            await flightMessage.react(reactEmoji);

            // Ephemeral response to the user
            await message.reply({ content: `Success. The flight-information embed has been sent to <#${mainChannel.id}>.`, ephemeral: true });

            // Flight Log Command
            const logChannel = await message.client.channels.fetch('1322187244487835680'); // Replace with your log channel ID
            if (!logChannel) throw new Error("Log channel not found.");

            await logChannel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#0073FF') // Blue for the log
                        .setTitle('Flight Command Log')
                        .addFields(
                            { name: 'User ID', value: userId, inline: true },
                            { name: 'Role', value: role.name, inline: true },
                            { name: 'User', value: message.author.username, inline: true },
                            { name: 'Host', value: host, inline: true },
                            { name: 'Flight Number', value: flightNumber, inline: true },
                            { name: 'Departure Airport', value: dep, inline: true },
                            { name: 'Arrival Airport', value: arr, inline: true },
                            { name: 'Aircraft', value: aircraft, inline: true },
                            { name: 'Gate', value: gate, inline: true },
                            { name: 'Duration', value: duration, inline: true },
                            { name: 'Flight Image', value: flightImage || 'No image provided', inline: true }
                        )
                        .setFooter({ text: `Logged by ${message.author.username} • TUI Web Management System` })
                        .setTimestamp()
                ]
            });

            // Button interaction handler (attending or not attending)
            const filter = i => i.customId === 'attending' || i.customId === 'not_attending'; // Allow everyone to interact with the buttons
            const collector = flightMessage.createMessageComponentCollector({ filter, time: 60000 }); // 60 seconds timeout

            collector.on('start', () => {
                console.log('Collector started.');
            });

            collector.on('end', (collected, reason) => {
                console.log('Collector ended:', reason);
                if (reason === 'time') {
                    console.log('Collector timed out.');
                }
            });

            // collector.on('collect', async (i) => {
            //     try {
            //         if (i.customId === 'attending') {
            //             // Log attendance
            //             const attendanceChannel = await message.client.channels.fetch('1322187244487835680'); // Replace with your attendance log channel ID
            //             if (!attendanceChannel) throw new Error("Attendance channel not found.");

            //             await attendanceChannel.send({
            //                 embeds: [
            //                     new EmbedBuilder()
            //                         .setColor('#00FF00') // Green for attending
            //                         .setTitle('Attendance Log')
            //                         .addFields(
            //                             { name: 'User', value: i.user.username, inline: true },
            //                             { name: 'Status', value: 'Attending', inline: true },
            //                             { name: 'Flight', value: flightNumber, inline: true },
            //                             { name: 'Host', value: host, inline: true }
            //                         )
            //                         .setFooter({ text: `Logged by ${i.user.username}` })
            //                         .setTimestamp()
            //                 ]
            //             });

            //             await i.reply({ content: "You are attending today's flight. A ticket will be sent soon. See you there!", ephemeral: true });
            //         } else if (i.customId === 'not_attending') {
            //             // Log non-attendance
            //             const attendanceChannel = await message.client.channels.fetch('1322187244487835680'); // Replace with your attendance log channel ID
            //             if (!attendanceChannel) throw new Error("Attendance channel not found.");

            //             await attendanceChannel.send({
            //                 embeds: [
            //                     new EmbedBuilder()
            //                         .setColor('#FF0000') // Red for not attending
            //                         .setTitle('Non-Attendance Log')
            //                         .addFields(
            //                             { name: 'User', value: i.user.username, inline: true },
            //                             { name: 'Status', value: 'Not Attending', inline: true },
            //                             { name: 'Flight', value: flightNumber, inline: true },
            //                             { name: 'Host', value: host, inline: true }
            //                         )
            //                         .setFooter({ text: `Logged by ${i.user.username}` })
            //                         .setTimestamp()
            //                 ]
            //             });

            //             await i.reply({ content: 'You are not attending the flight. Hope to see you on another flight!', ephemeral: true });
            //         }
            //     } catch (error) {
            //         console.error('Error while processing button interaction:', error);
            //         await i.reply({ content: 'There was an error while processing your request. Please try again later.', ephemeral: true });
            //     }
            // });

            collector.on('collect', async (i) => {
                try {
                    const userId = i.user.id;
                    const dataPath = path.resolve(__dirname, 'data.json');
                    const userData = JSON.parse(fs.readFileSync(dataPath));
            
                    if (userData.users && userData.users[userId]) {
                        await i.reply({
                            content: 'You have already clicked the button, please open a support ticket to change your choice.',
                            ephemeral: true
                        });
                        return;
                    }
            
                    userData.users = userData.users || {};
                    userData.users[userId] = { choice: i.customId };
                    fs.writeFileSync(dataPath, JSON.stringify(userData, null, 2));
            
                    const attendanceChannel = await message.client.channels.fetch('1322187244487835680');
                    if (!attendanceChannel) throw new Error("Attendance channel not found.");
            
                    if (i.customId === 'attending') {
                        const role = message.guild.roles.cache.get('1326183694725283920');
                        if (role) {
                            const member = await message.guild.members.fetch(userId);
                            await member.roles.add(role);
                        }
                        await attendanceChannel.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('#00FF00')
                                    .setTitle('Attendance Log')
                                    .addFields(
                                        { name: 'User', value: i.user.username, inline: true },
                                        { name: 'Status', value: 'Attending', inline: true },
                                        { name: 'Flight', value: flightNumber, inline: true },
                                        { name: 'Host', value: host, inline: true }
                                    )
                                    .setFooter({ text: `Logged by ${i.user.username}` })
                                    .setTimestamp()
                            ]
                        });
                        await i.reply({
                            content: "You are attending today's flight. A ticket will be sent soon. See you there!",
                            ephemeral: true
                        });
                    } else if (i.customId === 'not_attending') {
                        await attendanceChannel.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('#FF0000')
                                    .setTitle('Non-Attendance Log')
                                    .addFields(
                                        { name: 'User', value: i.user.username, inline: true },
                                        { name: 'Status', value: 'Not Attending', inline: true },
                                        { name: 'Flight', value: flightNumber, inline: true },
                                        { name: 'Host', value: host, inline: true }
                                    )
                                    .setFooter({ text: `Logged by ${i.user.username}` })
                                    .setTimestamp()
                            ]
                        });
                        await i.reply({
                            content: 'You are not attending the flight. Hope to see you on another flight!',
                            ephemeral: true
                        });
                    }
            
                    const updatedRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('attending')
                            .setLabel('I am attending!')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('not_attending')
                            .setLabel('I am not attending!')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                    );
            
                    await i.update({ components: [updatedRow] });
                } catch (error) {
                    console.error(`[${new Date().toISOString()}] Error while processing button interaction:`, error);
                    await i.reply({
                        content: 'There was an error while processing your request. Please try again later.',
                        ephemeral: true
                    });
                }
            });            

        } catch (error) {
            console.error('Error in command execution:', error);
            message.channel.send('There was an error processing your flight information request. Please try again later.');
        }
    }
};
