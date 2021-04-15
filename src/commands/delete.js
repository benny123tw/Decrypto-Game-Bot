const gameDB = require('../functions/gameDB');
const delay = require('../functions/delay');
const chalk = require('chalk');

module.exports = {
    name: 'delete',
    aliases: ['del'],
    permissions: ['ADMINISTRATOR', 'MANAGE_CHANNELS'],
    description: 'Quick delete game rooms and roles',
    async execute(options = {}, DB = {}) {
        const { message, args, cmd, bot, logger, Discord, language } = options;
        const { player, server} = DB;
        const lanData = language?.commands[this.name];
        if (lanData === undefined) return ( message.reply('language pack loading failed.'),
            logger.error(`Can't find ${chalk.redBright(`language.commands[\`${this.name}\`]}`)}`));
        /**
         * get player Data from DB and handle Promise object.
         */
        let gameData;
        await gameDB(bot, logger, message)
            .then(result => (gameData = result))
            .catch(err => console.log(err));

        if (gameData.onGame) return message.reply(lanData.error.onGame);

        // add delay to slow down the delete process
        // if ew remove the delay from here probably  will cause
        // server leave channel trash and have to restart discord
        // to fix it
        for (room of gameData.gameRooms.reverse()) {
            if (bot.client.channels.cache.get(room) != undefined)
            bot.client.channels.cache.get(room).delete();
            await delay(500);
        }

        // console.log(bot.client.guilds.cache.get(server.serverID).roles.cache)
        gameData.gameRoles.forEach(role => {
            if (bot.client.guilds.cache.get(server.serverID).roles.cache.get(role) != undefined)
                bot.client.guilds.cache.get(server.serverID).roles.cache.get(role).delete();
        });         
    }
};
