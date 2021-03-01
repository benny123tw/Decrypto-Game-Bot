module.exports = {
    name: 'balance',
    aliases: ['bal'],
    permissions: [],
    description: 'Check th user balance',
    async execute({ message, args, cmd, bot, logger, Discord }, DB) {
        message.channel.send(
            `Your wallet balance is ${DB.player.coins}, your banks bal is ${DB.player.bank}`,
        );
    },
};
