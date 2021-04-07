module.exports = {
    name: 'balance',
    aliases: ['bal'],
    permissions: [],
    description: 'Show user balance',
    async execute(options = {}, DB = {}) {
        const { message, args, cmd, bot, logger, Discord, language } = options;
        const { player } = DB;
        message.channel.send(
            `Your wallet balance is ${DB.player.coins}, your banks bal is ${player.bank}`,
        );
    },
};
