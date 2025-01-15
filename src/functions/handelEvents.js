const path = require('path');

module.exports = (client) => {
    
    client.handleEvents = async (eventFiles, eventPath) => {
        
        for (const file of eventFiles) {
            const filePath = path.join(eventPath, file);
            const event = require(filePath);

            if (!event.name) {
                console.error(`Event file "${file}" does not export a name.`);
                continue;
            }
            if (event.once) {
                console.log(`Attaching "once" listener for event: ${event.name}`);
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                console.log(`Attaching "on" listener for event: ${event.name}`);
                client.on(event.name, (...args) => event.execute(...args, client));
            }
            
            // if (event.once) {
            //     client.once(event.name, (...args) => event.execute(...args, client));
            // } else {
            //     client.on(event.name, (...args) => event.execute(...args, client));
            // }



            console.log(`Loaded event: ${event.name}`);
        }
    };
};