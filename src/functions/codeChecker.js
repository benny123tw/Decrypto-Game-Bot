const gameModel = require('../models/gameSchema');
const playerModel = require('../models/playerSchema');
const chalk = require('chalk');

const codeCorrectChecker = async (encrypter, player, logger) => {
    // BLUE TEAM
    if (player.team === 'BLUE') {

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

        // update all blue team career
        await playerModel.updateMany(
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
    if (player.team === 'RED') {
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

const codeIncorrectChecker = async (encrypter, player, logger) => {
    if (player.team === 'BLUE') {
        logger.modules(`${chalk.blueBright(`Blue`)} team got ${chalk.redBright(`Miscommunication Token`)}!`);
        if (encrypter && encrypter.team === 'BLUE') {
            const respone = await gameModel.findOneAndUpdate(
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

    if (player.team === 'RED') {
        logger.modules(`${chalk.redBright(`Red`)} team got ${chalk.redBright(`Miscommunication Token`)}!`);
        if (encrypter && encrypter.team === 'RED') {
            const respone = await gameModel.findOneAndUpdate(
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

module.exports = {
    codeCorrectChecker,
    codeIncorrectChecker,
}