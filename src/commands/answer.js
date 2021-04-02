const playerModel = require('../models/playerSchema');
const gameDB = require('../functions/gameDB');
const gameModel = require('../models/gameSchema');
const chalk = require('chalk');
const codeChecker = require('../functions/codeChecker');
const roundChecker = require('../functions/roundChecker');
const {rooms, teamObj} = require('../functions/gameRooms');

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
            
            message.client.channels.cache.get(gameData.gameRooms[rooms.blueTeamTextChannel]).send(`<@${gameData.blueTeam.encrypterId}> cheating!!\nCodes have been reset!`);
            message.client.channels.cache.get(gameData.gameRooms[rooms.redTeamTextChannel]).send(`<@${gameData.blueTeam.encrypterId}> cheating!!\nCodes have been reset!`);
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
            return message.reply(`Why you cheating huh?`);
        }

        if (gameData.curEncrypterTeam === 'RED' && message.author.id === gameData.redTeam.encrypterId) {
            
            message.client.channels.cache.get(gameData.gameRooms[rooms.blueTeamTextChannel]).send(`<@${gameData.redTeam.encrypterId}> cheating!!\nCodes have been reset!`);
            message.client.channels.cache.get(gameData.gameRooms[rooms.redTeamTextChannel]).send(`<@${gameData.redTeam.encrypterId}> cheating!!\nCodes have been reset!`);
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
        message.client.channels.cache.get(gameData.gameRooms[rooms.blueTeamTextChannel]).send(scoreEmbed);
        message.client.channels.cache.get(gameData.gameRooms[rooms.redTeamTextChannel]).send(scoreEmbed);

        // reset encrypter voice mute
        const encrypter = await message.guild.members.fetch(gameData[teamObj[gameData.curEncrypterTeam]].encrypterId);

        if (encrypter.voice)
            encrypter.voice.setMute(false);
        /**
         * change current encrypter team
         */
        if (gameData.curEncrypterTeam === 'BLUE' && gameData.answerers.includes('RED') 
            && gameData.answerers.includes('BLUE')) {
                console.log(`BLUE to RED`)
                await gameModel.findOneAndUpdate({serverId: message.guild.id}, {$set:{curEncrypterTeam: "RED", "blueTeam.isDescribe": false}});
            }            

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
                roundChecker.tie({ message, bot, logger, Discord }, DB, server);
            }

            else if ((server.blueTeam.intToken === 2 && server.redTeam.intToken === 2)
                    || server.blueTeam.intToken === 2 && server.redTeam.intToken === 2) {
                //do smthing tie fn
                roundChecker.tie({ message, bot, logger, Discord }, DB, server);    
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
                await roundChecker.reset(message, bot);
            }

            if (server.blueTeam.misToken === 2) {
                // do win lose fn
                // roundChecker.winLose({ message, bot, logger, Discord }, DB, server);
                logger.modules(`${chalk.blueBright(`Blue`)} Team lose!`);
                await playerModel.findOneAndUpdate(
                    { curServerId: message.guild.id, team: 'BLUE' }, 
                    { $inc: { total_Games: 1, loses: 1}});
                await roundChecker.reset(message, bot);
            }

            if (server.redTeam.intToken === 2) {
                //do win lose fn
                // roundChecker.winLose({ message, bot, logger, Discord }, DB, server);
                logger.modules(`${chalk.redBright(`Red`)} Team win!`);
                await playerModel.findOneAndUpdate(
                    { curServerId: message.guild.id, team: 'RED' }, 
                    { $inc: { total_Games: 1, wins: 1}});
                await roundChecker.reset(message, bot);
            }

            if (server.redTeam.misToken === 2) {
                // do win lose fn
                // roundChecker.winLose({ message, bot, logger, Discord }, DB, server);
                logger.modules(`${chalk.redBright(`Red`)} Team lose!`);
                await playerModel.findOneAndUpdate(
                    { curServerId: message.guild.id, team: 'RED' }, 
                    { $inc: { total_Games: 1, loses: 1}});
                await roundChecker.reset(message, bot);
            }       

            gameData = await gameModel.findOneAndUpdate({serverId: message.guild.id},
                {"blueTeam.curCodes": [], "redTeam.curCodes": []},{new: true});
            
            if (gameData.options.autoAssign)
                autoAssign(message, bot, Discord); // random encrypter (repeat)
        }
            
        gameData = await gameModel.findOne({serverId: message.guild.id});
        /**
         * Sending `reset codes` message to both channels and show the current tokens each team
         */
        message.client.channels.cache.get(gameData.gameRooms[rooms.blueTeamTextChannel]).send(`It's **${gameData.curEncrypterTeam} Team Encrypter** round!`);
        message.client.channels.cache.get(gameData.gameRooms[rooms.redTeamTextChannel]).send(`It's **${gameData.curEncrypterTeam} Team Encrypter** round!`);    
        

        // reset answerers
        await gameModel.findOneAndUpdate({ serverId: message.guild.id }, 
            { $set: {answerers: []}});
        
    },
};

const autoAssign = async (message, bot, Discord) => {
        let encrypterArray = [];
        // random pick 1 player from each team 
        //blue
        let randomUserBlueTeam = await playerModel.find({
            curServerId: message.guild.id, 
            team: "BLUE"
        });
        let index = Math.floor(Math.random() * randomUserBlueTeam.length);
        encrypterArray[0] = randomUserBlueTeam[index].playerId;

        // red
        let randomUserRedTeam = await playerModel.find({
            curServerId: message.guild.id, 
            team: "RED"
        });

        index = Math.floor(Math.random() * randomUserRedTeam.length);
        encrypterArray[1] = randomUserRedTeam[index].playerId;

        await gameModel.findOneAndUpdate({serverId: message.guild.id},
            {$set:{"blueTeam.encrypterId": encrypterArray[0], 
                    "redTeam.encrypterId": encrypterArray[1]}},{new: true})
                .then(result =>{
                    const bt_encrypter = new Discord.MessageEmbed().setColor('#e42643')
                    .setTitle('Blue Team Encrypter')
                    .setDescription(`${message.guild.members.cache.get(result.blueTeam.encrypterId).nickname} is current encrypter!`)
                    .setThumbnail(message.guild.members.cache.get(result.blueTeam.encrypterId).user.avatarURL())
                    .setFooter(
                        `${bot.config.footer}`
                    );
    
                    const rt_encrypter = new Discord.MessageEmbed().setColor('#e42643')
                    .setTitle('Blue Team Encrypter')
                    .setDescription(`${message.guild.members.cache.get(result.redTeam.encrypterId).nickname} is current encrypter!`)
                    .setThumbnail(message.guild.members.cache.get(result.redTeam.encrypterId).user.avatarURL())
                    .setFooter(
                        `${bot.config.footer}`
                    );
    
    
                    message.client.channels.cache.get(result.gameRooms[rooms.blueTeamTextChannel]).send(bt_encrypter);
                    message.client.channels.cache.get(result.gameRooms[rooms.redTeamTextChannel]).send(rt_encrypter);
                });
}
