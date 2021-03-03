const playerModel = require('../models/playerSchema');
const gameDB = require('../functions/gameDB');
const gameModel = require('../models/gameSchema');
const chalk = require('chalk');

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
        if (!gameData.onGame || gameData.redTeamKeywords.length === 0 
            || gameData.blueTeamKeywords.length === 0 || gameData.curCodes.length === 0) 
                return message.channel.send(`Haven't draw codes yet`);        

        /**
         *  if answerer is encrypter = cheating 
         *  increase cheating times and reset codes to []
         *  send to two channles message 'cheaing'
         */
        if (message.author.id === gameData.encrypterId) {
            message.client.channels.cache.get(gameData.gameRooms[1]).send(`<@${gameData.encrypterId}> cheating!!\nCodes have been reset!`);
            message.client.channels.cache.get(gameData.gameRooms[2]).send(`<@${gameData.encrypterId}> cheating!!\nCodes have been reset!`);
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
                        encrypterId: "",
                        curCodes: []
                    }
                }
            )
            
            return message.reply(`Why you cheating huh?`);
        }

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
         */
        if (args[0] == gameData.curCodes[0] && args[1] == gameData.curCodes[1]
            && args[2] == gameData.curCodes[2]) {

            // find encrypter's team
            const encrypter = await playerModel.findOne({ playerId:gameData.encrypterId });

            // BLUE TEAM
            if (DB.player.team === 'BLUE') {

                // if encrypter team is RED than increase blue team's interception token
                if (encrypter && encrypter.team === 'RED') {
                    logger.modules(`${chalk.blueBright(`Blue`)} team got ${chalk.greenBright(`Interception Token`)}!`);
                    const respone = await gameModel.findOneAndUpdate(
                        {
                            serverId: message.guild.id,
                        },
                        {
                            $inc: {
                                blueTeam_IntToken: 1,
                            },
                        },
                    );
                }

                // update all blue team career
                const playerRespone = await playerModel.updateMany(
                    {
                        team: "BLUE",
                        onGame: true
                    },
                    {
                        $inc: {
                            total_Games: 1,
                            wins: 1,
                        },
                    },
                );              
            }

            // RED TEAM
            if (DB.player.team === 'RED') {
                // if encrypter team is BLUE than increase red team's interception token
                if (encrypter && encrypter.team === 'BLUE') {
                    logger.modules(`${chalk.red(`Red`)} team got ${chalk.greenBright(`Interception Token`)}!`);
                    const respone = await gameModel.findOneAndUpdate(
                        {
                            serverId: message.guild.id,
                        },
                        {
                            $inc: {
                                redTeam_IntToken: 1,
                            },
                        },
                    );
                }

                // update all red team career
                const playerRespone = await playerModel.updateMany(
                    {
                        team: "RED",
                        onGame: true
                    },
                    {
                        $inc: {
                            total_Games: 1,
                            wins: 1,
                        },
                    },
                );
            }

            // if blue team or red team isn't answer than just return message
            let answerers = await gameModel.findOne({ serverId: message.guild.id });
            if (!answerers.answerers.includes('RED') || !answerers.answerers.includes('BLUE')) 
                return message.reply(`You're correct!`); 

            // reset curcodes and answerers
            const respone = await gameModel.findOneAndUpdate(
                {
                    serverId: message.guild.id,
                },
                {
                    $set: {
                        curCodes: [],
                        answerers: [],
                    },
                },
            );
            message.reply(`You're correct!`);
        }

        else {
            if (DB.player.team === 'BLUE') {
                logger.modules(`${chalk.blueBright(`Blue`)} team got ${chalk.redBright(`Miscommunication Token`)}!`);
                const encrypter = await playerModel.findOne({ playerId:gameData.encrypterId });
                if (encrypter && encrypter.team === 'BLUE') {
                    const respone = await gameModel.findOneAndUpdate(
                        {
                            serverId: message.guild.id,
                        },
                        {
                            $inc: {
                                blueTeam_MisToken: 1,
                            },
                        },
                    );
                }

                const playerRespone = await playerModel.updateMany(
                    {
                        team: "BLUE",
                        onGame: true
                    },
                    {
                        $inc: {
                            total_Games: 1,
                            loses: 1,
                        },
                    },
                );
            }

            if (DB.player.team === 'RED') {
                logger.modules(`${chalk.redBright(`Red`)} team got ${chalk.redBright(`Miscommunication Token`)}!`);
                const encrypter = await playerModel.findOne({ playerId:gameData.encrypterId });
                if (encrypter && encrypter.team === 'RED') {
                    const respone = await gameModel.findOneAndUpdate(
                        {
                            serverId: message.guild.id,
                        },
                        {
                            $inc: {
                                redTeam_MisToken: 1,
                            },
                        },
                    );
                }

                const playerRespone = await playerModel.updateMany(
                    {
                        team: "RED",
                        onGame: true
                    },
                    {
                        $inc: {
                            total_Games: 1,
                            loses: 1,
                        },
                    },
                );
            }

            // if blue team or red team isn't answer than just return message
            let answerers = await gameModel.findOne({ serverId: message.guild.id });
            console.log(answerers.answerers)
            if (!answerers.answerers.includes('RED') || !answerers.answerers.includes('BLUE')) 
                return message.reply(`You're wrong! Real codes: ${gameData.curCodes.join(', ')}`);

            const respone = await gameModel.findOneAndUpdate(
                {
                    serverId: message.guild.id,
                },
                {
                    $set: {
                        curCodes: [],
                    },
                },
            );

            message.reply(`You're wrong! The codes are: ${gameData.curCodes.join(', ')}`);
        }

        message.client.channels.cache.get(gameData.gameRooms[1]).send(`**Codes have been reset!**\nDraw the codes!`);
        message.client.channels.cache.get(gameData.gameRooms[2]).send(`**Codes have been reset!**\nDraw the codes!`);

        const scoreEmbed = new Discord.MessageEmbed()
            .setColor('#e42643')
            .setTitle(`Current 2 Teams Tokens`)
            .addFields(
                { name: 'BLUE', value: `✅ INT Token: **${gameData.blueTeam_IntToken}**\n\n😥 MIS Token: **${gameData.blueTeam_MisToken}**`},
                { name: '\u200B', value: '\u200B' },
                { name: 'RED', value: `✅ INT Token: **${gameData.redTeam_IntToken}**\n\n😥 MIS Token: **${gameData.redTeam_MisToken}**` },
                { name: '\u200B', value: '\u200B' },
            )
            .setFooter(
                `Copyright ©️ 2021 Decrypto. All right Reversed.`,
            );
        message.client.channels.cache.get(gameData.gameRooms[1]).send(scoreEmbed);
        message.client.channels.cache.get(gameData.gameRooms[2]).send(scoreEmbed);
    },
};
