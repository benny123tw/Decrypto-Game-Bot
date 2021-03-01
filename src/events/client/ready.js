const chalk = require('chalk');

module.exports = async (bot, Discord, logger) => {
    logger.info(chalk.cyan(`Logged in as: ${bot.client.user.tag} (id: ${bot.client.user.id})`));
    bot.client.user.setPresence({
        activity: {
            name: `${bot.config.prefix}help for help`,
        },
    });
};
