module.exports = (bot, lan) => {
        const Language = require('../../language/' + lan);
        bot.Language = new Language();
};
