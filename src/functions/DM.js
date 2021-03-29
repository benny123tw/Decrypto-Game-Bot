const chalk = require('chalk');
// const playerModel = require('../models/playerSchema');
const serverModel = require('../models/serverSchema');

const execute = async ({bot, Discord, logger, message}, {user}) => {
    console.log(`${chalk.italic.cyanBright(message.author.username)} is sending DM to ${chalk.italic.cyanBright(bot.config.name)}\nContent: ${chalk.blueBright(message.content)}`)    
    console.log(message.author)
    /**
     * Ignore all messages without our prefix.
     */
    if (!message.content.startsWith('~')) {
        if (!user.onCustomer)
            return custormerService({bot, Discord, logger, message}, {user: user});
        return;
    }
        

    const args = message.content.slice(1).split(/ +/);
    const cmd = args.shift().toLowerCase();

    try {
        /**
         * get command(includes aliases) from commands and if didn't find comand will thorw error
         */
        const command =
            bot.DM_commands.get(cmd) || bot.DM_commands.find(a => a.aliases && a.aliases.includes(cmd));

        const server = {
            message: message,
            args: args,
            cmd: cmd,
            bot: bot,
            logger: logger,
            Discord: Discord,
        };
        command.execute(server, {user: user});
    } catch (error) {
        logger.error(chalk.red(error));
        message.reply('there was an error trying to execute that command!');
    }
}

const playerModel = require('../models/playerSchema');
const custormerService = async ({bot, Discord, logger, message}, {user}) => {
    await playerModel.findOneAndUpdate({playerId: user.playerId},{$set:{onCustomer:true}});
    message.channel.send(`Hi <@${message.author.id}> welcome to ${bot.config.name} Help Center!`);
    message.channel.send(`If you want to execute commands please using this prefix: ${bot.config.prefix}`);
    message.channel.send(`How can I help you?`);  
    
    
    //for test
    await playerModel.findOneAndUpdate({playerId: user.playerId}, {$set:{onCustomer: false}});
}

const sendDMtoUser = async ({bot, Discord, logger, message}) => { 
    if (message.author.bot) return;
    const id = message.content.split(/ +/).splice(0,1).join('');
    const content = message.content.slice(id.length+1).split(/ +/).join(' ');
    try {
        await message.client.users.fetch(`${id}`, true).then( user => {
            user.send(`${content}`);
        }).catch(err => logger.error(err));
    } catch (error) {
        logger.error(chalk.red(error));
    }
    
    return;
}

module.exports = {
    execute,
    sendDMtoUser,
}
