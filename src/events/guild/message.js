const chalk = require('chalk');
const playerDB = require('../../functions/playerDB');
const decryptoDB = require('../../functions/serverDB');
const DM = require('../../functions/DM');
const lanHandler = require('../../handlers/language_handler');
const serverModel = require('../../models/serverSchema');

module.exports = async (bot, Discord, logger, message) => {
    /**
     * ignore every Bots message.
     * this function has to be here, cause we don't want bot generate the player data.
     */
    if (message.author.bot) return;

    // customer service sketch
    if (message.author.id === '262961005137494017'
    && message.channel.id === '826027115119116318') DM.sendDMtoUser({bot, Discord, logger, message});

    /**
     * get player Data from DB and handle Promise object.
     */
    let playerData;
    await playerDB(bot, logger, message)
        .then(result => (playerData = result))
        .catch(err => console.log(err));
    if (!playerData || playerData === undefined) return;

    /**
     * DM channel caommands handlers
     */
     if (message.channel.type === 'dm') {
        return DM.execute({
            bot: bot,
            Discord: Discord,
            logger: logger,
            message: message
        }, {
            user: playerData,
        })
    } 


    /**
     * get server Data from DB and handle Promise object.
     */
    let serverData;
    await decryptoDB(bot, logger, message)
        .then(result => (serverData = result))
        .catch(err => console.log(err));
    if (!serverData || serverData === undefined) return;

    if (serverData.language !== bot.Language) lanHandler(bot, serverData.language);

    const language = bot.Language;

    /**
     * Ignore all messages without our prefix.
     */
    if (!message.content.startsWith(serverData.prefix)) return;

    /**
     * Arguments convert to command( remve prefix and space ).
     */
    const args = message.content.slice(serverData.prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();
    try {
        /**
         * get command(includes aliases) from commands and if didn't find comand will thorw error
         */
        const command =
            bot.commands.get(cmd) || bot.commands.find(a => a.aliases && a.aliases.includes(cmd));

        /**
         * check permissions is valid and member's permission
         */
        if (command.permissions.length) {
            const invalidPerms = [];
            for (const perm of command.permissions) {
                /**
                 * Check if permissiosns we set is valid
                 */
                if (!validPermissions.includes(perm)) {
                    return console.log(`Invalid Permissions ${perm}`);
                }

                /** 
                 * Check if member has that permissions
                 */
                if (!message.member.hasPermission(perm)) {
                    invalidPerms.push(perm);
                }
            }
            if (invalidPerms.length) {
                return message.channel.send(`${language.error.message.permission}\`${invalidPerms}\``);
            }
        }

        /**
         * wrap DB and server object and excute command
         */
        const DB = {
            server: serverData,
            player: playerData,
        };
        const server = {
            message,
            args,
            cmd,
            bot,
            logger,
            Discord,
        };
        command.execute(server, DB);
    } catch (error) {
        logger.error(chalk.red(error));
        message.reply(language.error.message.execute);
    }
};

/**
 * valid permissions from discord
 */
const validPermissions = [
    'CREATE_INSTANT_INVITE',
    'KICK_MEMBERS',
    'BAN_MEMBERS',
    'ADMINISTRATOR',
    'MANAGE_CHANNELS',
    'MANAGE_GUILD',
    'ADD_REACTIONS',
    'VIEW_AUDIT_LOG',
    'PRIORITY_SPEAKER',
    'STREAM',
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'SEND_TTS_MESSAGES',
    'MANAGE_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'MENTION_EVERYONE',
    'USE_EXTERNAL_EMOJIS',
    'VIEW_GUILD_INSIGHTS',
    'CONNECT',
    'SPEAK',
    'MUTE_MEMBERS',
    'DEAFEN_MEMBERS',
    'MOVE_MEMBERS',
    'USE_VAD',
    'CHANGE_NICKNAME',
    'MANAGE_NICKNAMES',
    'MANAGE_ROLES',
    'MANAGE_WEBHOOKS',
    'MANAGE_EMOJIS',
];
