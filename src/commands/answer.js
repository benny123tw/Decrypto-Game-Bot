const playerModel = require('../models/playerSchema');
const gameDB = require('../functions/gameDB');
const gameModel = require('../models/gameSchema');
const chalk = require('chalk');
const codeChecker = require('../functions/codeChecker');
const roundChecker = require('../functions/roundChecker');
const {rooms, teamObj} = require('../functions/gameRooms');
const {autoAssign} = require('../functions/distribute');

module.exports = {
    name: 'answer',
    aliases: ['a', 'ans'],
    permissions: [],
    description: 'answer the codes',
    async execute(options = {}, DB = {}) {
        const { message, args, cmd, bot, logger, Discord, language } = options;
        const { player } = DB;
        const lanData = language?.commands[this.name];
        if (lanData === undefined) return ( message.reply('language pack loading failed.'),
            logger.error(`Can't find ${chalk.redBright(`language.commands[\`${this.name}\`]}`)}`));

        /**
         * get game Data from DB and handle Promise object.
         */
        let gameData;
        await gameDB(bot, logger, message)
            .then(result => (gameData = result))
            .catch(err => console.log(err));
        if (!gameData || gameData === undefined) return;

        /**
         * Return if codes haven't draw
         */
        if (!gameData.onGame || gameData.redTeam.keywords.length === 0 
            || gameData.blueTeam.keywords.length === 0 || gameData[teamObj[gameData.curEncrypterTeam].name].curCodes.length === 0) 
                return message.channel.send(lanData.error.notDraw);        

        /**
         *  if answerer is encrypter = cheating 
         *  increase cheating times and reset codes to []
         *  send to two channles message 'cheaing'
         */
        if (gameData.curEncrypterTeam === 'BLUE' && message.author.id === gameData.blueTeam.encrypterId) {
            
            message.client.channels.cache.get(gameData.gameRooms[rooms.blueTeamTextChannel]).send(lanData.cheat.channels(gameData.blueTeam.encrypterId));
            message.client.channels.cache.get(gameData.gameRooms[rooms.redTeamTextChannel]).send(lanData.cheat.channels(gameData.blueTeam.encrypterId));
            await gameModel.findOneAndUpdate(
                {
                    serverId: message.guild.id,
                },
                {
                    $inc: {
                        total_Games: 1,
                        cheats: 1,
                    },
                    $set: {
                        "blueTeam.curCodes": [],
                        answerers: []
                    }
                }
            )
            return message.reply(lanData.cheat.person);
        }

        if (gameData.curEncrypterTeam === 'RED' && message.author.id === gameData.redTeam.encrypterId) {
            
            message.client.channels.cache.get(gameData.gameRooms[rooms.blueTeamTextChannel]).send(lanData.cheat.channels(gameData.redTeam.encrypterId));
            message.client.channels.cache.get(gameData.gameRooms[rooms.redTeamTextChannel]).send(lanData.cheat.channels(gameData.redTeam.encrypterId));
            await gameModel.findOneAndUpdate(
                {
                    serverId: message.guild.id,
                },
                {
                    $inc: {
                        total_Games: 1,
                        cheats: 1,
                    },
                    $set: {
                        "redTeam.curCodes": [],
                        answerers: []
                    }
                }
            )
            
            return message.reply(lanData.cheat.person);
        }

        // check if team send two times answer
        if (gameData.answerers.includes(player.team))
            return message.reply(lanData.repeat);

        switch (player.team) {
            case 'BLUE':
                await gameModel.findOneAndUpdate({serverId:message.guild.id},{$push:{answerers:'BLUE'}});
                break;
            case 'RED':
                await gameModel.findOneAndUpdate({serverId:message.guild.id},{$push:{answerers:'RED'}});
                break;
        } 

        /**
         *  if answer is correct check answerer team 
         *  increase total games and win games
         *  and check if they can get the token
         *  BLUE TEAM
         */
        
        if (gameData.curEncrypterTeam === 'BLUE') {
            console.log(`en: blue team`)
            // find encrypter's team
            const encrypter = await playerModel.findOne({ playerId:gameData.blueTeam.encrypterId });
            if (args[0] == gameData.blueTeam.curCodes[0] && args[1] == gameData.blueTeam.curCodes[1]
                && args[2] == gameData.blueTeam.curCodes[2]) {
                    console.log(`correct`)
                let checker = await codeChecker.codeCorrectChecker(encrypter, options, DB);
                if (!checker) return message.react(`✅`); 
            } else {
                console.log(`incorrect`)
                let checker = await codeChecker.codeIncorrectChecker(encrypter, options, DB);
                if (!checker) {
                    if (encrypter.team === 'BLUE')
                        return message.channel.send(lanData.wrong(gameData.blueTeam.curCodes));
                    if (encrypter.team === 'RED')
                        return message.channel.send(lanData.wrong(gameData.redTeam.curCodes));
                }
            }
        }        

        /**
         *  if answer is correct check answerer team 
         *  increase total games and win games
         *  and check if they can get the token
         *  RED TEAM
         */

        if (gameData.curEncrypterTeam === 'RED') {
            console.log(`en: red team`)
            // find encrypter
            const encrypter = await playerModel.findOne({ playerId:gameData.redTeam.encrypterId });
            if (args[0] == gameData.redTeam.curCodes[0] && args[1] == gameData.redTeam.curCodes[1]
                && args[2] == gameData.redTeam.curCodes[2]) {
                console.log(`correct`)
                let checker = await codeChecker.codeCorrectChecker(encrypter, options, DB);
                if (!checker) return message.react(`✅`); 
            } else {
                console.log(`incorrect`)
                let checker = await codeChecker.codeIncorrectChecker(encrypter, options, DB);
                if (!checker) {
                    if (encrypter.team === 'BLUE')
                        return message.channel.send(lanData.wrong(gameData.blueTeam.curCodes));
                    if (encrypter.team === 'RED')
                        return message.channel.send(lanData.wrong(gameData.redTeam.curCodes));
                }
            }
        }

        gameData = await gameModel.findOne({ serverId: message.guild.id });
        const scoreEmbed = new Discord.MessageEmbed()
            .setColor(lanData.embed.score.color)
            .setTitle(lanData.embed.score.title)
            .addFields(
                { name: lanData.embed.score.fields.blue, value: `${lanData.embed.score.fields.intToken}**${gameData.blueTeam.intToken}**\n\n${lanData.embed.score.fields.misToken}**${gameData.blueTeam.misToken}**`},
                { name: '\u200B', value: '\u200B' },
                { name: lanData.embed.score.fields.red, value: `${lanData.embed.score.fields.intToken}**${gameData.redTeam.intToken}**\n\n${lanData.embed.score.fields.misToken}**${gameData.redTeam.misToken}**` },
                { name: '\u200B', value: '\u200B' },
            )
            .setFooter(
                `${bot.config.footer}`,
            );
        message.client.channels.cache.get(gameData.gameRooms[rooms.blueTeamTextChannel]).send(scoreEmbed);
        message.client.channels.cache.get(gameData.gameRooms[rooms.redTeamTextChannel]).send(scoreEmbed);

        // reset encrypter voice mute
        const encrypter = await message.guild.members.fetch(gameData[teamObj[gameData.curEncrypterTeam].name].encrypterId);

        if (encrypter.voice.channel)
            encrypter.voice.setMute(false);
        /**
         * change current encrypter team
         */
        if (gameData.curEncrypterTeam === 'BLUE' && gameData.answerers.includes('RED') 
            && gameData.answerers.includes('BLUE')) {
                console.log(`BLUE to RED`)
                await gameModel.findOneAndUpdate({serverId: message.guild.id}, {$set:{curEncrypterTeam: "RED", "blueTeam.isDescribe": false}});
            }            

        
        let winningTeam = 0;
        if (gameData.curEncrypterTeam === 'RED' && gameData.answerers.includes('RED') 
            && gameData.answerers.includes('BLUE')) {
                console.log(`RED to BLUE`)
            await gameModel.findOneAndUpdate({serverId: message.guild.id}, {$set:{curEncrypterTeam: "BLUE", "redTeam.isDescribe": false}});  

            /**
             *  there are 8 conditions to deal with
             *  4 tie and 4 normal win, lose
             *  
             *  first we need to check if it is tie or not
             *  then call the tie fn
             * 
             *  next we will checking the normal w/l conditions
             *  then do the normal fn
             */
            const server = await gameModel.findOne({ serverId: message.guild.id });

            if ((server.blueTeam.intToken === 2 && server.blueTeam.misToken === 2)
                || (server.redTeam.intToken === 2 && server.redTeam.misToken === 2)) {
                //do smthing tie fn
                winningTeam = await roundChecker.tie(options, DB, server);
            }

            else if ((server.blueTeam.intToken === 2 && server.redTeam.intToken === 2)
                    || server.blueTeam.intToken === 2 && server.redTeam.intToken === 2) {
                //do smthing tie fn
                winningTeam = await roundChecker.tie(options, DB, server);    
            }

            // else if (rounds > 8) { // do tie fn}

            // win / lose handler
            if (server.blueTeam.intToken === 2) {
                // do win lose fn
                // roundChecker.winLose({ message, bot, logger, Discord }, DB, server);
                logger.modules(`${chalk.blueBright(`Blue`)} Team win!`);

                await playerModel.findOneAndUpdate(
                    { curServerId: message.guild.id, team: 'BLUE' }, 
                    { $inc: { total_Games: 1, wins: 1}});
                await roundChecker.reset(options);

                winningTeam = 1;
            }

            if (server.blueTeam.misToken === 2) {
                // do win lose fn
                // roundChecker.winLose({ message, bot, logger, Discord }, DB, server);
                logger.modules(`${chalk.blueBright(`Blue`)} Team lose!`);
                await playerModel.findOneAndUpdate(
                    { curServerId: message.guild.id, team: 'BLUE' }, 
                    { $inc: { total_Games: 1, loses: 1}});
                await roundChecker.reset(options);

                winningTeam = 2;
            }

            if (server.redTeam.intToken === 2) {
                //do win lose fn
                // roundChecker.winLose({ message, bot, logger, Discord }, DB, server);
                logger.modules(`${chalk.redBright(`Red`)} Team win!`);
                await playerModel.findOneAndUpdate(
                    { curServerId: message.guild.id, team: 'RED' }, 
                    { $inc: { total_Games: 1, wins: 1}});
                await roundChecker.reset(options);

                winningTeam = 2;
            }

            if (server.redTeam.misToken === 2) {
                // do win lose fn
                // roundChecker.winLose({ message, bot, logger, Discord }, DB, server);
                logger.modules(`${chalk.redBright(`Red`)} Team lose!`);
                await playerModel.findOneAndUpdate(
                    { curServerId: message.guild.id, team: 'RED' }, 
                    { $inc: { total_Games: 1, loses: 1}});
                await roundChecker.reset(options);

                winningTeam = 1;
            }       

            gameData = await gameModel.findOneAndUpdate({serverId: message.guild.id},
                {"blueTeam.curCodes": [], "redTeam.curCodes": []},{new: true});
        }

        console.log(winningTeam)
        if (!gameData.onGame) return roundChecker.gameOverMessage(options, gameData, _winningOjb[winningTeam]);
        
        if (gameData.options.autoAssign)
                autoAssign(options); // random encrypter (repeat)
            
        gameData = await gameModel.findOne({serverId: message.guild.id});
        /**
         * Sending `reset codes` message to both channels and show the current tokens each team
         */
        message.client.channels.cache.get(gameData.gameRooms[rooms.blueTeamTextChannel]).send(lanData.encrypterRound(gameData.curEncrypterTeam));
        message.client.channels.cache.get(gameData.gameRooms[rooms.redTeamTextChannel]).send(lanData.encrypterRound(gameData.curEncrypterTeam));    
        

        // reset answerers
        await gameModel.findOneAndUpdate({ serverId: message.guild.id }, 
            { $set: {answerers: []}});
        
    },
};

const _winningOjb = {
    0: 'Tie',
    1: 'Blue',
    2: 'Red',
}
