const chalk = require('chalk');
const serverModel = require('../models/serverSchema');

/**
 * finding server data from databse
 * if not then init the data
 * return Promise;
 *
 * @param {Object} bot
 * @param {Object} logger
 * @param {Object} message
 * @returns {Promise} serverData
 */

const serverDB = async (bot, logger, message) => {
    let serverData;
    try {
        serverData = await serverModel.findOne({ serverID: message.guild.id });
        if (!serverData) {
            const server = await serverModel.create({
                serverID: message.guild.id,
                serverName: message.guild.name,
                prefix: bot.config.prefix,
                emoji: '👍',
                thumbsUp: false,
            });
            server.save();
            logger.info(chalk.redBright(`Didn't find data on db. Generating...`));
            serverData = await serverModel.findOne({ serverID: message.guild.id });
        }
    } catch (error) {
        logger.error(chalk.red(error));
    }

    return serverData;
};

module.exports = serverDB;
