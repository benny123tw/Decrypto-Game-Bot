const playerModel = require('../models/playerSchema');
const channel = require('chalk');

module.exports = {
    name: 'deposits',
    aliases: ['dp', 'depo'],
    permissions: [],
    description: 'deposits money to bank',
    async execute(options = {}, DB = {}) {
        const { message, args, cmd, bot, logger, Discord, language } = options;
        const { player, server} = DB;
        const lanData = language?.commands[this.name];
        if (lanData === undefined) return ( message.reply('language pack loading failed.'),
            logger.error(`Can't find ${chalk.redBright(`language.commands[\`${this.name}\`]}`)}`));

        if (!args[0]) return message.reply(lanData.error.money);
        if (isNaN(args[0])) return message.reply(lanData.error.number);

        if (player.coins < args[0]) return message.reply(lanData.error.valid);

        const respone = await playerModel.findOneAndUpdate(
            {
                playerId: message.author.id,
            },
            {
                $inc: {
                    coins: -1 * args[0],
                    bank: args[0],
                },
            },
        );
        return message.reply(lanData.depositMoney(args[0]));
    },
};
