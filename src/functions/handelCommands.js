const fs = require("fs");

module.exports = (client) => {
    client.handleCommands = async (commandFolders, path) => {
        client.commands = new Map();
        console.log(commandFolders);
        console.log(path);

        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`${path}/${folder}`).filter(file => file.endsWith(".js"));

            for (const file of commandFiles) {
                const command = require(`../commands/${folder}/${file}`);

                if (!command.name) {
                    console.error(`Command in file ${file} is missing a name.`);
                    continue;
                }

                client.commands.set(command.name, command);
            }
        }

        console.log("Successfully loaded all commands.");
    };
};