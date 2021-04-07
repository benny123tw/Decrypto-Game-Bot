const gameModel = require('../models/gameSchema');

module.exports = {
    name: 'unpin',
    aliases: [],
    permissions: ['ADMINISTRATOR', 'MANAGE_CHANNELS'],
    description: 'Quick unpin the message',
    async execute(options = {}, DB = {}) {
        const { message, args, cmd, bot, logger, Discord, language } = options;
        const { player, server } = DB;

        // Get pinned messages
        message.channel.messages.fetchPinned()
        .then(messages => messages.forEach(message => {
            if (message.author.id === bot.client.user.id) message.unpin()
        }))
        .catch(console.error);         
    },
};
