const chalk = require('chalk');

module.exports = async (bot, Discord, logger, error) => {
    logger.error(chalk.red(`Client error: ${error.message}`));
};
