const playerModel = require('../models/playerSchema');
const gameDB = require('../functions/gameDB');
const gameModel = require('../models/gameSchema');

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

        if (!gameData.onGame || gameData.redTeamKeywords.length === 0 
            || gameData.blueTeamKeywords.length === 0 || gameData.curCodes.length === 0) 
                return message.channel.send(`Haven't draw codes yet`);        
        
        if (args[0] == gameData.curCodes[0] && args[1] == gameData.curCodes[1]
            && args[2] == gameData.curCodes[2] && DB.player.team === 'BLUE') {
                console.log(`blue + 1`)
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
                message.reply(`You're correct!`);            
        }

        else if (args[0] == gameData.curCodes[0] && args[1] == gameData.curCodes[1]
            && args[2] == gameData.curCodes[2] && DB.player.team === 'RED') {
                console.log(`red + 1`)
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
                message.reply(`You're correct!`);            
        }

        else {
            if (DB.player.team === 'BLUE') {
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

            message.reply(`You're wrong! Real codes: ${gameData.curCodes.join(', ')}`);

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
        }
    },
};
