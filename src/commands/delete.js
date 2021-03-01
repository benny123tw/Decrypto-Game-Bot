const { parseInt } = require('lodash');
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
        gameData.gameRooms.forEach(room => {
            if (bot.client.channels.cache.get(room) != undefined)
                bot.client.channels.cache.get(room).delete();
        })
        // console.log(bot.client.guilds.cache.get(DB.server.serverID).roles.cache)
        gameData.gameRoles.forEach(role => {
            if (bot.client.guilds.cache.get(DB.server.serverID).roles.cache.get(role) != undefined)
            bot.client.guilds.cache.get(DB.server.serverID).roles.cache.get(role).delete();
        })         
    },
};
