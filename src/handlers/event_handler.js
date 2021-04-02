const fs = require('fs');

module.exports = (bot, Discord, logger) => {
    const load_dir = dirs => {
        const event_files = fs
            .readdirSync(`./src/events/${dirs}`)
            .filter(file => file.endsWith('.js'));

        for (const file of event_files) {
            const event = require(`../events/${dirs}/${file}`);
            const event_name = file.split('.')[0];
            bot.client.on(event_name, event.bind(null, bot, Discord, logger));
        }
    };

    ['client', 'guild'].forEach(e => load_dir(e));
};
