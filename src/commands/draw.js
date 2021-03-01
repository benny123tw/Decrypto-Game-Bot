const { keyword } = require('chalk');
const gameDB = require('../functions/gameDB');

module.exports = {
    name: 'draw',
    aliases: ['d', 'keywrod', 'code', 'key', 'keywords', 'codes'],
    permissions: [],
    description: 'deposits money to bank',
    async execute({ message, args, cmd, bot, logger, Discord }, DB) {
        let gameData;
        await gameDB(bot, logger, message)
            .then(result => (gameData = result))
            .catch(err => console.log(err));

        if(!args[0]) 
            return message.reply(`Enter \`${bot.config.prefix}draw (key/code)\` to execute the command.`);
        if(cmd.startsWith('key') || args[0].startsWith('key'))
            return message.channel.send(`Your keywords: ${drawCard(gameData.keywords, 4).join(', ')}`)
        if(cmd.startsWith('code') || args[0].startsWith('code'))
            return message.channel.send(`Your codes: ${drawCard(gameData.codes, 3).join(', ')}`)
       
    },
};

const drawCard = (cards, quantity) => {
    let result = [];
    for (let i = 0; i < quantity; i++) {
        const ran = Math.floor(Math.random() * (cards.length - i));
        result.push(cards[ran]);
        cards[ran] = cards[cards.length - i - 1];
    };

    return result;
}
