const gameModel = require('../models/gameSchema');
const chalk = require('chalk');

const codeCorrectChecker = async (encrypter, options = {}, DB = {}) => {
    const { message, args, cmd, bot, logger, Discord, language } = options;
    const { player, server } = DB;

    // BLUE TEAM
    if (player.team === 'BLUE') {
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
    if (player.team === 'RED') {
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

const codeIncorrectChecker = async (encrypter, options = {}, DB = {}) => {
    const { message, args, cmd, bot, logger, Discord, language } = options;
    const { player, server } = DB;

    if (player.team === 'BLUE') {
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

    if (player.team === 'RED') {
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
        message.channel.send(language.codeChecker.wrong(gameData.blueTeam.curCodes));
    if (gameData.curEncrypterTeam === 'RED')
        message.channel.send(language.codeChecker.wrong(gameData.redTeam.curCodes));
    return true;
}

module.exports = {
    codeCorrectChecker,
    codeIncorrectChecker,
}