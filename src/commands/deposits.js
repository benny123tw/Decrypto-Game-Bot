const playerModel = require('../models/playerSchema');

module.exports = {
    name: 'deposits',
    aliases: ['dp', 'depo'],
    permissions: [],
    description: 'deposits money to bank',
    async execute({ message, args, cmd, bot, logger, Discord }, DB) {
        if (!args[0]) return message.reply(`Please enter money you want to deposits`);
        if (isNaN(args[0])) return message.reply('Please enter real number!');

        if (DB.player.coins < args[0]) return message.reply(`Please enter valid amount!`);

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
        return message.channel.send(
            `${message.author.username}, you deposited \`${args[0]}\` **coins** to your bank!`,
        );
    },
};
