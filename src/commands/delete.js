const gameDB = require('../functions/gameDB');

module.exports = {
    name: 'delete',
    aliases: ['del'],
    permissions: ['ADMINISTRATOR', 'MANAGE_CHANNELS'],
    description: 'Quick delete game rooms and roles',
    async execute({ message, args, cmd, bot, logger, Discord }, DB) {
        /**
         * get player Data from DB and handle Promise object.
         */
        let gameData;
        await gameDB(bot, logger, message)
            .then(result => (gameData = result))
            .catch(err => console.log(err));

        if (gameData.onGame) return message.reply(`Please do not use this command while game is still playing`);

        // add delay to slow down the delete process
        // if ew remove the delay from here probably  will cause
        // server leave channel trash and have to restart discord
        // to fix it
        for (room of gameData.gameRooms.reverse()) {
            if (bot.client.channels.cache.get(room) != undefined)
            bot.client.channels.cache.get(room).delete();
            await delay(500);
        }

        // console.log(bot.client.guilds.cache.get(DB.server.serverID).roles.cache)
        gameData.gameRoles.forEach(role => {
            if (bot.client.guilds.cache.get(DB.server.serverID).roles.cache.get(role) != undefined)
                bot.client.guilds.cache.get(DB.server.serverID).roles.cache.get(role).delete();
        });         
    }
};

delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
