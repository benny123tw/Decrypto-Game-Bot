const chalk = require('chalk');

module.exports = async (bot, Discord, logger, event) => {
    logger.warn(chalk.yellow(`Disconnected: ${event.reason} (${event.code})`));
};
