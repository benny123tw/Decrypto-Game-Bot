const chalk = require('chalk');
const playerModel = require('../models/playerSchema');

/**
 * finding player data from database
 * if not then init player data
 * return Promise object.
 *
 * @param {Object} bot
 * @param {Object} logger
 * @param {Object} message
 * @returns {Promise} playerData
 */
const playerDB = async (bot, logger, message) => {
    // player database init and finding
    let playerData;
    try {
        playerData = await playerModel.findOne({ playerId: message.author.id });
        if (!playerData) {
            const player = await playerModel.create({
                playerId: message.author.id,
                playerName: message.author.username,
                coins: 100,
                total_Games: 0,
                wins: 0,
                loses: 0,
            });
            player.save();
            logger.info(chalk.redBright(`Didn't find data on db. Generating...`));
            playerData = await playerModel.findOne({ playerId: message.author.id });
        }
    } catch (error) {
        logger.error(chalk.red(error));
    }

    return playerData;
};

module.exports = playerDB;
