const chalk = require('chalk');

module.exports = {
    name: 'balance',
    aliases: ['bal'],
    permissions: [],
    description: 'Show user balance',
    async execute(options = {}, DB = {}) {
        const { message, args, cmd, bot, logger, Discord, language } = options;
        const { player } = DB;
        const lanData = language?.commands[this.name];
        if (lanData === undefined) return ( message.reply('language pack loading failed.'),
            logger.error(`Can't find ${chalk.redBright(`language.commands[\`${this.name}\`]}`)}`));
        message.channel.send(
            `Your wallet balance is ${player.coins}, your banks bal is ${player.bank}`,
        );
    },
};
