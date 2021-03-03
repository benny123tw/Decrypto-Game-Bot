const chalk = require('chalk');
const gameModel = require('../models/gameSchema');

/**
 * finding games data from database
 * if not then init game data
 * return Promise object.
 *
 * @param {Object} bot
 * @param {Object} logger
 * @param {Object} message
 * @returns {Promise} gameData
 */
const gameDB = async (bot, logger, message) => {
    // game database init and finding
    let gameData;
    try {
        gameData = await gameModel.findOne({ serverId: message.guild.id });
        if (!gameData) {
            const game = await gameModel.create({
                serverId: message.guild.id,
                serverName: message.guild.name,
                curEncrypterTeam: 'BLUE',
                onGame: 0,
            });
            game.save();
            logger.info(chalk.redBright(`Didn't find data on db. Generating...`));
            gameData = await gameModel.findOne({ serverId: message.guild.id });
        }
    } catch (error) {
        logger.error(chalk.red(error));
    }

    return gameData;
};

module.exports = gameDB;
