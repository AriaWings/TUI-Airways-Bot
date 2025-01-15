const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');

// Import handleEvents.js
require('./functions/handelEvents')(client);
require('./functions/handelCommands')(client);
(async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected successfully.');

        const eventPath = path.resolve('./src/events');
        const functionPath = path.resolve('./src/functions');
        const commandPath = path.resolve('./src/commands');
        const functions = fs.existsSync(functionPath) ? fs.readdirSync(functionPath).filter(file => file.endsWith('.js')) : [];
        //const eventFiles = fs.existsSync('./src/events') ? fs.readdirSync('./src/events').filter(file => file.endsWith('.js')) : [];


        


const eventFiles = fs.existsSync(eventPath) ? fs.readdirSync(eventPath).filter(file => file.endsWith('.js')) : [];

console.log(eventFiles)
console.log(`Found ${eventFiles.length} event files.`);

if (eventFiles.length > 0) {
    client.handleEvents(eventFiles, eventPath);
} else {
    console.error('No events found in the events directory.');
}

// const path = require('path');

// // Check the resolved path
// console.log('Events directory path:', path.resolve('./src/events'));

// const eventFiles2 = fs.existsSync('./src/events') ? fs.readdirSync('./src/events').filter(file => file.endsWith('.js')) : [];

// console.log(`Found ${eventFiles2.length} event files:`, eventFiles);


        const commandFolders = fs.existsSync(commandPath) ? fs.readdirSync(commandPath) : [];
        
        console.log(`Loading ${functions.length} functions...`);
        for (const file of functions) require(`./functions/${file}`)(client);
        
        
        console.log(`Loading commands from ${commandFolders.length} folders...`);
        client.handleCommands(commandFolders, commandPath);
        
        await client.login(process.env.token);
        
    } catch (error) {
        console.error('Error starting the bot:', error);
    }
})();