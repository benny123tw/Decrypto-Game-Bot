const chalk = require('chalk');
const gameDB = require('../functions/gameDB');
const gameModel = require('../models/gameSchema');

module.exports = {
    name: 'draw',
    aliases: ['d', 'keywrod', 'code', 'key', 'keywords', 'codes'],
    permissions: [],
    description: 'draw codes or keywords',
    async execute(options = {}, DB = {}) {
        const { message, args, cmd, bot, logger, Discord, language } = options;
        const { player, server } = DB;
        const lanData = language?.commands[this.name];
        if (lanData === undefined) return ( message.reply('language pack loading failed.'),
            logger.error(`Can't find ${chalk.redBright(`language.commands[\`${this.name}\`]}`)}`));

        let gameData;
        await gameDB(bot, logger, message)
            .then(result => (gameData = result))
            .catch(err => console.log(err));
        
        if (!gameData.onGame || !player.onGame) return message.reply(lanData.error.onGame);
        if (!gameData.gameRooms.includes(message.channel.id)) return message.reply(lanData.error.channel);

        if(!args[0]) 
            return message.reply(lanData.error.syntax(server.prefix));

        if(cmd.startsWith('key') || args[0].startsWith('key')) {

            // check if keywords have been drew
            if (player.team === 'BLUE' && gameData.blueTeam.keywords.length) return message.reply(lanData.error.isDrew); 
            else if (player.team === 'RED' && gameData.redTeam.keywords.length) return message.reply(lanData.error.isDrew); 

            let keyString = '', count = 1;
            let keyArray = drawCard(gameData.keywords, 4);
            keyArray.forEach(key => {
                keyString += `${count++}. **${key}**\n`;
            });
            if (!gameData.blueTeam.keywords.length && !gameData.redTeam.keywords.length) 
                await gameModel.findOneAndUpdate({serverId: message.guild.id}, {$inc:{curGames: 1}});
                
            if (player.team === 'BLUE' && message.channel.id === gameData.gameRooms[1]) {
                await gameModel.findOneAndUpdate(
                    {
                        serverId: message.guild.id,
                    },
                    {
                        $set: {
                            "blueTeam.keywords": keyArray,
                        },
                    },
                );
            }
            if (player.team === 'RED' && message.channel.id === gameData.gameRooms[2]) {
                const respone = await gameModel.findOneAndUpdate(
                    {
                        serverId: message.guild.id,
                    },
                    {
                        $set: {
                            "redTeam.keywords": keyArray,
                        },
                    },
                );
            }
            
            const updateGameData = await gameModel.findOne({serverId: message.guild.id});
            const keyEmbed = new Discord.MessageEmbed()
                .setColor(lanData.embed.key.color)
                .setTitle(lanData.embed.key.title)
                .addFields(
                    { name: '\u200B', value: '\u200B' },
                    { name: lanData.drawRounds(updateGameData.curGames), value: `${keyString}` },
                    { name: '\u200B', value: '\u200B' },
                )
                .setFooter(
                    `${bot.config.footer}`,
                );
            return await message.channel.send(keyEmbed).then(msg => msg.pin());
        }

        // if autoAssign is true check player id is eqaul to specified player id
        if (gameData.options.autoAssign && gameData.blueTeam.encrypterId !== message.author.id
            && gameData.redTeam.encrypterId !== message.author.id) return message.reply(lanData.error.notEncrypter);

            
        if(cmd.startsWith('code') || args[0].startsWith('code')) {

            if (player.team !== gameData.curEncrypterTeam) return message.reply('Your team is not in encrypter round');

            if (player.team === 'BLUE' && gameData.blueTeam.curCodes.length) return message.channel.send(lanData.error.drawCode(gameData.blueTeam.encrypterId));
            else if (player.team === 'RED' && gameData.redTeam.curCodes.length) return message.channel.send(lanData.error.drawCode(gameData.redTeam.encrypterId));
            
            const codeArray = drawCard(gameData.codes, 3);
            
            if (player.team === 'BLUE')
                await gameModel.findOneAndUpdate(
                    {
                        serverId: message.guild.id,
                    },
                    {
                        $set: {
                            "blueTeam.curCodes": codeArray,
                            "blueTeam.encrypterId": message.author.id
                        },
                    },
                );

            else if (player.team === 'RED')
                await gameModel.findOneAndUpdate(
                    {
                        serverId: message.guild.id,
                    },
                    {
                        $set: {
                            "redTeam.curCodes": codeArray,
                            "redTeam.encrypterId": message.author.id
                        },
                    },
                );
            const updateGameData = await gameModel.findOne({serverId: message.guild.id});
            const codeEmbed = new Discord.MessageEmbed()
                .setColor(lanData.embed.code.color)
                .setTitle(lanData.embed.code.title)
                .addFields(
                    { name: '\u200B', value: '\u200B' },
                    { name: lanData.drawRounds(updateGameData.curGames), value: `${codeArray.join(', ')}` },
                    { name: '\u200B', value: '\u200B' },
                )
                .setFooter(
                    `${bot.config.footer}`,
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
