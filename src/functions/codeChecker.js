const gameModel = require('../models/gameSchema');
const gameDB = require('../functions/gameDB');
const playerModel = require('../models/playerSchema');
const chalk = require('chalk');

const codeCorrectChecker = async (encrypter, { message, args, cmd, bot, logger, Discord }, DB) => {
    // BLUE TEAM
    if (DB.player.team === 'BLUE') {
        console.log(`ans: BLUE`)
        // if encrypter team is RED than increase blue team's interception token
        if (encrypter && encrypter.team === 'RED') {
            logger.modules(`${chalk.blueBright(`Blue`)} team got ${chalk.greenBright(`Interception Token`)}!`);
            await gameModel.findOneAndUpdate(
                {
                    serverId: message.guild.id,
                },
                {
                    $inc: {
                        "blueTeam.intToken": 1,
                    },
                },
            );
        }              
    }

    // RED TEAM
    if (DB.player.team === 'RED') {
        console.log(`ans: RED`)
        // if encrypter team is BLUE than increase red team's interception token
        if (encrypter && encrypter.team === 'BLUE') {
            logger.modules(`${chalk.red(`Red`)} team got ${chalk.greenBright(`Interception Token`)}!`);
            const respone = await gameModel.findOneAndUpdate(
                {
                    serverId: message.guild.id,
                },
                {
                    $inc: {
                        "redTeam.intToken": 1,
                    },
                },
            );
        }
    }

    // if blue team or red team isn't answer than just return message
    let answerers = await gameModel.findOne({ serverId: message.guild.id });
    console.log(`current answerers: ${answerers.answerers}`);
    if (!answerers.answerers.includes('RED') || !answerers.answerers.includes('BLUE')) {
        return false; 
    }

    message.react(`✅`);
    return true;
}

const codeIncorrectChecker = async (encrypter, { message, args, cmd, bot, logger, Discord }, DB) => {

    if (DB.player.team === 'BLUE') {
        console.log(`ans: BLUE`)
        if (encrypter && encrypter.team === 'BLUE') {
            logger.modules(`${chalk.blueBright(`Blue`)} team got ${chalk.redBright(`Miscommunication Token`)}!`);
        await gameModel.findOneAndUpdate(
                {
                    serverId: message.guild.id,
                },
                {
                    $inc: {
                        "blueTeam.misToken": 1,
                    },
                },
            );
        }
    }

    if (DB.player.team === 'RED') {
        console.log(`ans: RED`)
        if (encrypter && encrypter.team === 'RED') {
        logger.modules(`${chalk.redBright(`Red`)} team got ${chalk.redBright(`Miscommunication Token`)}!`);
            await gameModel.findOneAndUpdate(
                {
                    serverId: message.guild.id,
                },
                {
                    $inc: {
                        "redTeam.misToken": 1,
                    },
                },
            );
        }
    }

    // get the db data (will get data after switch team)
    let gameData = await gameModel.findOne({serverId: message.guild.id});

    // if blue team or red team isn't answer than just return message
    
    console.log(`current answerers: ${gameData.answerers}`);
    if (!gameData.answerers.includes('RED') || !gameData.answerers.includes('BLUE')) {
        message.react(`❌`);
        return false;
    }

    message.react(`❌`);
    if (gameData.curEncrypterTeam === 'BLUE')
        message.channel.send(`The codes are: **${gameData.blueTeam.curCodes.join(', ')}**`);
    if (gameData.curEncrypterTeam === 'RED')
        message.channel.send(`The codes are: **${gameData.redTeam.curCodes.join(', ')}**`);
    return true;
}

module.exports = {
    codeCorrectChecker,
    codeIncorrectChecker,
}