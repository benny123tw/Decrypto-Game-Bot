const playerModel = require('../models/playerSchema');
const gameDB = require('../functions/gameDB');
const gameModel = require('../models/gameSchema');
const chalk = require('chalk');
const codeChecker = require('../functions/codeChecker');

module.exports = {
    name: 'answer',
    aliases: ['a', 'ans'],
    permissions: [],
    description: 'answer the codes',
    async execute({ message, args, cmd, bot, logger, Discord }, DB) {

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
            || gameData.blueTeam.keywords.length === 0 || gameData.blueTeam.curCodes.length === 0
            || gameData.redTeam.curCodes.length === 0) 
                return message.channel.send(`some team haven't draw codes/keywords yet`);        

        /**
         *  if answerer is encrypter = cheating 
         *  increase cheating times and reset codes to []
         *  send to two channles message 'cheaing'
         */
        if (gameData.curEncrypterTeam === 'BLUE' && message.author.id === gameData.blueTeam.encrypterId) {
            
            message.client.channels.cache.get(gameData.gameRooms[1]).send(`<@${gameData.blueTeam.encrypterId}> cheating!!\nCodes have been reset!`);
            message.client.channels.cache.get(gameData.gameRooms[2]).send(`<@${gameData.blueTeam.encrypterId}> cheating!!\nCodes have been reset!`);
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
                        "blueTeam.encrypterId": "",
                        "blueTeam.curCodes": []
                    }
                }
            )
            
            return message.reply(`Why you cheating huh?`);
        }

        if (gameData.curEncrypterTeam === 'RED' && message.author.id === gameData.redTeam.encrypterId) {
            
            message.client.channels.cache.get(gameData.gameRooms[1]).send(`<@${gameData.redTeam.encrypterId}> cheating!!\nCodes have been reset!`);
            message.client.channels.cache.get(gameData.gameRooms[2]).send(`<@${gameData.redTeam.encrypterId}> cheating!!\nCodes have been reset!`);
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
                        "redTeam.encrypterId": "",
                        "redTeam.curCodes": []
                    }
                }
            )
            
            return message.reply(`Why you cheating huh?`);
        }

        // check if team send two times answer
        if (gameData.answerers.includes(DB.player.team))
            return message.reply(`Don't send the answer 2 times`);

        switch (DB.player.team) {
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
                let checker = await codeChecker.codeCorrectChecker(encrypter, { message, args, cmd, bot, logger, Discord }, DB);
                if (!checker) return message.react(`✅`); 
            } else {
                console.log(`incorrect`)
                let checker = await codeChecker.codeIncorrectChecker(encrypter, { message, args, cmd, bot, logger, Discord }, DB);
                if (!checker) {
                    if (encrypter.team === 'BLUE')
                        return message.channel.send(`The codes are: **${gameData.blueTeam.curCodes.join(', ')}**`);
                    if (encrypter.team === 'RED')
                        return message.channel.send(`The codes are: **${gameData.redTeam.curCodes.join(', ')}**`);
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
                let checker = await codeChecker.codeCorrectChecker(encrypter, { message, args, cmd, bot, logger, Discord }, DB);
                if (!checker) return message.react(`✅`); 
            } else {
                console.log(`incorrect`)
                let checker = await codeChecker.codeIncorrectChecker(encrypter, { message, args, cmd, bot, logger, Discord }, DB);
                if (!checker) {
                    if (encrypter.team === 'BLUE')
                        return message.channel.send(`The codes are: **${gameData.blueTeam.curCodes.join(', ')}**`);
                    if (encrypter.team === 'RED')
                        return message.channel.send(`The codes are: **${gameData.redTeam.curCodes.join(', ')}**`);
                }
            }
        }

        gameData = await gameModel.findOne({ serverId: message.guild.id });
        const scoreEmbed = new Discord.MessageEmbed()
            .setColor('#e42643')
            .setTitle(`Current 2 Teams Tokens`)
            .addFields(
                { name: 'BLUE', value: `✅ INT Token: **${gameData.blueTeam.intToken}**\n\n😥 MIS Token: **${gameData.blueTeam.misToken}**`},
                { name: '\u200B', value: '\u200B' },
                { name: 'RED', value: `✅ INT Token: **${gameData.redTeam.intToken}**\n\n😥 MIS Token: **${gameData.redTeam.misToken}**` },
                { name: '\u200B', value: '\u200B' },
            )
            .setFooter(
                `${bot.config.footer}`,
            );
        message.client.channels.cache.get(gameData.gameRooms[1]).send(scoreEmbed);
        message.client.channels.cache.get(gameData.gameRooms[2]).send(scoreEmbed);

        /**
         * change current encrypter team
         */
        if (gameData.curEncrypterTeam === 'BLUE' && gameData.answerers.includes('RED') 
            && gameData.answerers.includes('BLUE')) {
                await gameModel.findOneAndUpdate({serverId: message.guild.id}, {$set:{curEncrypterTeam: "RED"}});
            }            

        if (gameData.curEncrypterTeam === 'RED' && gameData.answerers.includes('RED') 
            && gameData.answerers.includes('BLUE')) {

            await gameModel.findOneAndUpdate({serverId: message.guild.id}, {$set:{curEncrypterTeam: "BLUE"}});  
            
            /**
             * Check if there have 2 tokens 
             */
            const server = await gameModel.findOne({ serverId: message.guild.id });


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

            
            // if any token > 2 then do win/lose checker
            if (server.blueTeam.intToken >= 2 || server.blueTeam.misToken >= 2 ||
                server.redTeam.intToken >= 2 || server.redTeam.misToken >= 2) {

                // blue team and red team not tie then
                // blue team win = red team loose
                if (server.blueTeam.intToken >= 2 && server.redTeam.intToken < 2) {
                    logger.modules(`${chalk.blueBright(`Blue`)} Team win!`);

                    await playerModel.updateMany({ team: "BLUE", onGame: true, serverId: message.guild.id },
                    { $inc: { total_Games: 1, wins: 1, }, },);

                    await playerModel.updateMany({ team: "RED", onGame: true, serverId: message.guild.id },
                    { $inc: { total_Games: 1, loses: 1, }, },);
                }

                // blue team and red team not tie then
                // blue team win = red team loose
                else if (server.redTeam.intToken >= 2 && server.blueTeam.intToken < 2) {
                    logger.modules(`${chalk.redBright(`Red`)} Team win!`);

                    await playerModel.updateMany({ team: "RED", onGame: true, serverId: message.guild.id },
                    { $inc: { total_Games: 1, wins: 1, }, },);

                    await playerModel.updateMany({ team: "BLUE", onGame: true, serverId: message.guild.id },
                    { $inc: { total_Games: 1, loses: 1, }, },);
                }
                    
                // when blue team and red team tie
                if ((server.blueTeam.intToken === server.redTeam.intToken && server.blueTeam.intToken >= 2)
                    || (server.blueTeam.misToken === server.redTeam.misToken && server.blueTeam.misToken >= 2)) {

                    let blueTeamScore = server.blueTeam.intToken - server.blueTeam.misToken;
                    let redTeamScore = server.redTeam.intToken - server.redTeam.misToken;

                    if (blueTeamScore > redTeamScore) {
                        logger.modules(`${chalk.blueBright(`Blue`)} Team win!`);

                        await playerModel.updateMany({ team: "BLUE", onGame: true, serverId: message.guild.id },
                        { $inc: { total_Games: 1, wins: 1, }, },);

                        await playerModel.updateMany({ team: "RED", onGame: true, serverId: message.guild.id },
                        { $inc: { total_Games: 1, loses: 1, }, },);
                    } 

                    if (redTeamScore > blueTeamScore) {
                        logger.modules(`${chalk.redBright(`Red`)} Team win!`);

                        await playerModel.updateMany({ team: "RED", onGame: true, serverId: message.guild.id },
                        { $inc: { total_Games: 1, wins: 1, }, },);

                        await playerModel.updateMany({ team: "BLUE", onGame: true, serverId: message.guild.id },
                        { $inc: { total_Games: 1, loses: 1, }, },);
                    }

                    logger.modules(`${chalk.redBright(`Red`)} Team and ${chalk.redBright(`Blue`)} Team both win!`);
                    
                }
            }            
        }
            
        gameData = await gameModel.findOne({serverId: message.guild.id});
        /**
         * Sending `reset codes` message to both channels and show the current tokens each team
         */
        message.client.channels.cache.get(gameData.gameRooms[1]).send(`It's **${gameData.curEncrypterTeam} Team** round!`);
        message.client.channels.cache.get(gameData.gameRooms[2]).send(`It's **${gameData.curEncrypterTeam} Team** round!`);       

        // reset answerers
        await gameModel.findOneAndUpdate({ serverId: message.guild.id }, { $set: {answerers: []}});

        //unpin all bot's pinned message
        bot.commands.get(`unpin`).execute({ message, args, cmd, bot, logger, Discord }, DB);

        //reset all game elem 
        await gameModel.findOneAndUpdate(
            {
                serverId: message.guild.id,
            },
            {
                $set: {
                    "blueTeam.keywords": [],
                    "redTeam.keywords": [],
                    "blueTeam.intToken": 0,
                    "blueTeam.misToken": 0,
                    "redTeam.intToken": 0,
                    "redTeam.misToken": 0,
                    "blueTeam.encrypterId": '',
                    "redTeam.encrypterId": '',
                    "blueTeam.curCodes": [],
                    "redTeam.curCodes": [],
                    answerers: [],
                }
            }
        )
    },
};
