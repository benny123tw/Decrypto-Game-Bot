const playerModel = require('../models/playerSchema');

module.exports = {
    name: 'ping',
    aliases: [],
    permissions: [],
    description: 'Ping! Pong?',
    async execute(options = {}, DB = {}) {
        const { message, args, cmd, bot, logger, Discord, language } = options;
        const { player, server } = DB;

        const delay = Date.now() - message.createdAt;
        message.reply(`**pong** *(delay: ${delay}ms)*`); 
        console.log(message.guild.members.cache.get(message.author.id).user.username);
    },
};
