const chalk = require('chalk');
const gameDB = require('../functions/gameDB');
const gameModel = require('../models/gameSchema');

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
        
        if (!gameData.onGame || !DB.player.onGame) return message.reply(`You're not in game`);
        if (!gameData.gameRooms.includes(message.channel.id)) return message.reply(`Please type in Game Room!(Under Decrypto category)`);

        if(!args[0]) 
            return message.reply(`Enter \`${bot.config.prefix}draw (key/code)\` to execute the command.`);
        if(cmd.startsWith('key') || args[0].startsWith('key')) {

            // check if keywords have been drew
            if (gameData.blueTeamKeywords.length) return message.reply(`Keywords have been drew!`); 
            else if (gameData.redTeamKeywords.length) return message.reply(`Keywords have been drew!`); 

            let keyString = '', count = 1;
            let keyArray = drawCard(gameData.keywords, 4);
            keyArray.forEach(key => {
                keyString += `${count++}. **${key}**\n`;
            });
            if (!gameData.blueTeamKeywords.length && !gameData.redTeamKeywords.length) 
                await gameModel.findOneAndUpdate({serverId: message.guild.id}, {$inc:{curGames: 1}});

            if (message.channel.id === gameData.gameRooms[1]) {
                await gameModel.findOneAndUpdate(
                    {
                        serverId: message.guild.id,
                    },
                    {
                        $set: {
                            blueTeamKeywords: keyArray,
                        },
                    },
                );
            }
            if (message.channel.id === gameData.gameRooms[2]) {
                const respone = await gameModel.findOneAndUpdate(
                    {
                        serverId: message.guild.id,
                    },
                    {
                        $set: {
                            redTeamKeywords: keyArray,
                        },
                    },
                );
            }
            
            const keyEmbed = new Discord.MessageEmbed()
                .setColor('#e42643')
                .setTitle('KeyWords')
                .addFields(
                    { name: '\u200B', value: '\u200B' },
                    { name: `Game ${gameData.curGames}`, value: `${keyString}` },
                    { name: '\u200B', value: '\u200B' },
                )
                .setFooter(
                    `Copyright ©️ 2021 Decrypto. All right Reversed.`,
                );
            return message.channel.send(keyEmbed);
        }
            
        if(cmd.startsWith('code') || args[0].startsWith('code')) {
            if (gameData.curCodes.length) return message.channel.send(`<@${gameData.encrypterId}> has drew the codes already`);
            
            const codeArray = drawCard(gameData.codes, 3);
            const respone = await gameModel.findOneAndUpdate(
                {
                    serverId: message.guild.id,
                },
                {
                    $set: {
                        curCodes: codeArray,
                        encrypterId: message.author.id
                    },
                },
            );
            const codeEmbed = new Discord.MessageEmbed()
                .setColor('#e42643')
                .setTitle('Codes')
                .addFields(
                    { name: '\u200B', value: '\u200B' },
                    { name: `Game ${gameData.curGames}`, value: `${codeArray.join(', ')}` },
                    { name: '\u200B', value: '\u200B' },
                )
                .setFooter(
                    `Copyright ©️ 2021 Decrypto. All right Reversed.`,
                );
            return message.author.send(codeEmbed)
        }
            
       
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
