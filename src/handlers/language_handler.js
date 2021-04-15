const fs = require('fs');

module.exports = (bot, Discord) => {
    const language_files = fs.readdirSync('./language/js/').filter(file => file.endsWith('.js'));

    for (const file of language_files) {
        const lan = require(`../../language/js/${file}`);
        bot.Language[file.split('.')[0]] = new lan();
    }
};
