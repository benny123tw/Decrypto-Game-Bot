const chalk = require('chalk');


/**
 * passing server object and gameData, handle tie sitduation
 * caculate which team is winner
 * @param {Object} Server 
 * @param {Object} DB 
 * @param {Object} gameData 
 */
const tie = async ({ message, bot, logger, Discord }, DB, gameData) => {

    let blueTeamScore = gameData.blueTeam.intToken - gameData.blueTeam.misToken;
    let redTeamScore = gameData.redTeam.intToken - gameData.redTeam.misToken;

    if (blueTeamScore > redTeamScore) {
        // blue team win red team lose'
        logger.modules(`${chalk.blueBright(`Blue`)} Team win!`);
        logger.modules(`${chalk.redBright(`Red`)} Team lose!`);
        await playerModel.findOneAndUpdate(
            { curServerId: message.guild.id, team: 'BLUE' }, 
            { $inc: { total_Games: 1, wins: 1}});
        await playerModel.findOneAndUpdate(
            { curServerId: message.guild.id, team: 'RED' }, 
            { $inc: { total_Games: 1, loses: 1}});
        await reset(message, bot);
    }

    if (redTeamScore > blueTeamScore) {
        // blue team win red team lose'
        logger.modules(`${chalk.redBright(`Red`)} Team win!`);
        logger.modules(`${chalk.blueBright(`Blue`)} Team lose!`);
        await playerModel.findOneAndUpdate(
            { curServerId: message.guild.id, team: 'RED' }, 
            { $inc: { total_Games: 1, wins: 1}});
        await playerModel.findOneAndUpdate(
            { curServerId: message.guild.id, team: 'BLUE' }, 
            { $inc: { total_Games: 1, loses: 1}});
        await reset(message, bot);
    }

    if (blueTeamScore === redTeamScore) {
        logger.modules(`${chalk.cyanBright(`Tie!`)}`);
        await reset(message, bot);
    }
}

const winLose = ({ message, args, cmd, bot, logger, Discord }, DB, gameData) => {
    
}

const gameModel = require('../models/gameSchema');
const reset = async (message, bot) => {

    let gameData = await gameModel.findOne({serverId: message.guild.id});

    //unpin all bot's pinned message in both game rooms
    message.client.channels.cache.get(gameData.gameRooms[1]).messages.fetchPinned()
        .then(messages => messages.forEach(message => {
            if (message.author.id === bot.client.user.id) message.unpin()
        }))
        .catch(console.error); 

    message.client.channels.cache.get(gameData.gameRooms[2]).messages.fetchPinned()
        .then(messages => messages.forEach(message => {
            if (message.author.id === bot.client.user.id) message.unpin()
        }))
        .catch(console.error); 
    

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
}

module.exports = {
    tie,
    winLose,
    reset,
}