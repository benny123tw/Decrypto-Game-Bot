const chalk = require('chalk');
const gameDB = require('../functions/gameDB');
const gameModel = require('../models/gameSchema');
const distribute = require('../functions/distribute');
const playerModel = require('../models/playerSchema');
const {channelCreate, rooms} = require('../functions/gameRooms');

/**
 *  Syntax: $start <rounds> <mode> <participates> <options> 
 *          $start 3 random 8 -auto
 */
module.exports = {
    name: 'start',
    aliases: [],
    permissions: [],
    description: 'start the decrypto game! (normal / random)',
    /**
     * 
     * @param {Object} options
     * @param {String} options.message
     * @param {Array} options.args
     * @param {String} options.cmd
     * @param {Object} options.bot
     * @param {String} options.logger
     * @param {String} options.Discord
     * @param {Object} options.language 
     * @param {Object} DB 
     * @param {Object} DB.player
     * @param {Object} DB.server
     */
    async execute(options = {}, DB = {}) {
        const { message, args, cmd, bot, logger, Discord, language } = options;
        const { player, server } = DB;
        
        /**
         *  init options object
         */
        let gameOptions = {
            gameMode: 'normal',
            autoAssign: true,
            rounds: 3,
            // blueTeamFirstEncrypter: null, 
            // redTeamFirstEncrypter: null, 
        };

        // setting rounds. when over 10 set rounds to 3
        if (!isNaN(args[0])) {
            if (args[0] > 10) message.reply(language.error.start.rounds);
            gameOptions.rounds = args[0] > 10 ? 3 : args[0];
            args.shift();
        }

        // check if player set gamemode to random(default: normal)
        if (args[0] === 'random') gameOptions.gameMode = 'random';

        for (const arg of args) {
            if (!arg.startsWith('-')) continue;
            if (arg.endsWith('auto') || arg.endsWith('a')) gameOptions.autoAssign = false;
        }



        /**
         * get game Data from DB and handle Promise object.
         */
        let gameData;
        await gameDB(bot, logger, message)
            .then(result => (gameData = result))
            .catch(err => console.log(err));

        await gameModel.findOneAndUpdate(
            {
                serverId: message.guild.id,
            },
            {
                $set: {
                    onGame: true,
                    curGame: 1,
                },
            },
        );

        /**
         * fetch all the roles in the server
         * and check if they have the same roles as DB
         * if not create a new role and uddate to DB
         */
        let roleResult = [false, false];
        await message.guild.roles.fetch()
            .then(roles => {
                roles.cache.forEach(role => {
                    if (role.id === gameData.gameRoles[0])
                        roleResult[0] = true;
                    if (role.id === gameData.gameRoles[1])
                        roleResult[1] = true;
                })
            })
            .catch(console.error);

        const _highest = message.guild.roles.highest.rawPosition;

        // create a blue team role
        if (roleResult[0] === false) {
            // Create a new role with data and a reason
        
            await message.guild.roles.create({
                data: {
                    name: `[${bot.config.name}]Blue Team`,
                    color: 'BLUE',
                    permissions: ['VIEW_CHANNEL'],
                    hoist: true,             
                    position: -1,
            },
                reason: 'TEAMS FOR DECRYPTO BOT TO PLAY GAME',   
            })
                .then(newrole => {
                    gameData.gameRoles[0] = newrole.id;
                    console.log(`Your role ${newrole.name}'s id is ${newrole.id}`);
                })
                .catch(console.error);
            
        }  
        
        //create a red team role
        if (roleResult[1] === false) {
            // Create a new role with data and a reason
            await message.guild.roles.create({
                data: {
                    name: `[${bot.config.name}]Red Team`,
                    color: 'RED',
                    permissions: ['VIEW_CHANNEL'],
                    hoist: true,
                    position: -1,

            },
                reason: 'TEAMS FOR DECRYPTO BOT TO PLAY GAME',
            })
                .then(newrole => {
                    gameData.gameRoles[1] = newrole.id;
                    console.log(`Your role ${newrole.name}'s id is ${newrole.id}`)
                })
                .catch(console.error);
        }

        // update new role to DB
        if(roleResult.includes(false))
            await gameModel.findOneAndUpdate({
                serverId: message.guild.id
            }, {
                    $set: {
                        gameRoles: gameData.gameRoles,
                    },            
            }).then(logger.info(chalk.greenBright(`Update gameRoles ${chalk.cyan(gameData.gameRoles)} to database`)))
            .catch(error => logger.error(chalk.red(error)));

        /**
         * create rooms for game
         * make it private only gamers/moderators can see
         * Structure and index: 
         * Game-Categorry -0
         *      |_blueteam-textChannl -1
         *      |_redteam-textChannel -2
         *      |_Common-voiceChannel -3
         *      |_blueteam-voiceChannel -4
         *      |_redteam-voiceChannel -5
         */

        // 03/31/2021 edit: can't create catgories under category

        let roomResult = [false, false, false, false, false];
        await message.guild.fetch()
            .then(guild => {
                //sort collection to array
                const channelsArr = guild.channels.cache.array();
                for (let i=0; i<channelsArr.length; i++) {
                    if (gameData.gameRooms.includes(channelsArr[i].id))
                        roomResult[gameData.gameRooms.indexOf(channelsArr[i].id)] = true;
                }
            })
            .catch(console.error);
 
        let rootCategory = gameData.gameRooms[rooms.root]  || null; // get the new category object. Default: DB room[0]
        if (!roomResult[rooms.root]) {

            const channel_id = await channelCreate('Decrypto Game Rooms', {
                type: 'category',
                allow: gameData.gameRoles
            }, {message: message, logger: logger});

            rootCategory = channel_id;
            gameData.gameRooms[rooms.root] = channel_id;
        }

        if (!roomResult[rooms.commonVoiceChannel]) {

            const channel_id = await channelCreate('Common Voice Channel', {
                type: 'voice',
                allow: gameData.gameRoles,
                parent: rootCategory
            }, {message, logger});

            gameData.gameRooms[rooms.commonVoiceChannel] = channel_id;
        }
         
        if (!roomResult[rooms.blueTeamTextChannel]) {

            const channel_id = await channelCreate('Blue Team - Text Channel', {
                type: 'text',
                allow: gameData.gameRoles[0],
                parent: rootCategory
            }, {message, logger});

            gameData.gameRooms[rooms.blueTeamTextChannel] = channel_id;
        }

        if (!roomResult[rooms.blueTeamVoiceChannel]) {

            const channel_id = await channelCreate('Blue Team - Voice Channel', {
                type: 'voice',
                allow: gameData.gameRoles[0],
                parent: rootCategory
            }, {message, logger});

            gameData.gameRooms[rooms.blueTeamVoiceChannel] = channel_id;
        }

        if (!roomResult[rooms.redTeamTextChannel]) {

            const channel_id = await channelCreate('Red Team - Text Channel', {
                type: 'text',
                allow: gameData.gameRoles[1],
                parent: rootCategory
            }, {message, logger});

            gameData.gameRooms[rooms.redTeamTextChannel] = channel_id;
        }

        if (!roomResult[rooms.redTeamVoiceChannel]) {

            const channel_id = await channelCreate('Red Team - Voice Channel', {
                type: 'voice',
                allow: gameData.gameRoles[1],
                parent: rootCategory
            }, {message, logger});

            gameData.gameRooms[rooms.redTeamVoiceChannel] = channel_id;
        }
        
        // update new rooms to DB
        if(roomResult.includes(false))
            gameData = await gameModel.findOneAndUpdate({
                serverId: message.guild.id
            }, {
                    $set: {
                        gameRooms: gameData.gameRooms,
                    },            
            },{new: true}).then(logger.info(chalk.greenBright(`Update gameRooms ${chalk.cyan(gameData.gameRooms)} to database`)))
            .catch(error => logger.error(chalk.red(error)));

        Object.keys(rooms).forEach( async key => {
            if (!key.startsWith('blueTeam') && !key.startsWith('redTeam')
            && !key.startsWith('common')) return;

            let allow = [];
            if (key.startsWith('blueTeam'))
                allow.push(message.guild.roles.cache.get(gameData.gameRoles[0]));

            else if (key.startsWith('redTeam'))
                allow.push(message.guild.roles.cache.get(gameData.gameRoles[1]));
            
            else if (key.startsWith('common')) {
                allow.push(message.guild.roles.cache.get(gameData.gameRoles[0]));
                allow.push(message.guild.roles.cache.get(gameData.gameRoles[1]));
            }                

            allow.forEach( async role => {
                await message.guild.channels.cache.get(gameData.gameRooms[rooms[key]])
                .updateOverwrite(
                    role,
                    {
                        VIEW_CHANNEL: true
                    }
                )
            })
            
        });

        gameData = await gameModel.findOneAndUpdate(
            { serverId: message.guild.id },
            { $set: { options: gameOptions } },{new: true}
        );

        // message.channel.send(`Game initialization completed.`);
        
        if (gameOptions.gameMode === 'random') 
            distribute.randomDistribute(options, gameData);
        if (gameOptions.gameMode === 'normal')
            distribute.normal(options, gameData);
        // distribute.test({ message, args, cmd, bot, logger, Discord }, gameData);
    },
};


