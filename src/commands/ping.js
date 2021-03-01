module.exports = {
    name: 'ping',
    aliases: [],
    permissions: [],
    description: 'Ping! Pong?',
    execute({ message, args, cmd, bot, logger, Discord }, DB) {
        const delay = Date.now() - message.createdAt;
        message.reply(`**pong** *(delay: ${delay}ms)*`);
    },
};
