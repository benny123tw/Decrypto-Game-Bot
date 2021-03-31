const chalk = require('chalk');
const gameDB = require('../functions/gameDB');
const gameModel = require('../models/gameSchema');
const distribute = require('../functions/distribute');
const playerModel = require('../models/playerSchema');
const {channelCreate, rooms} = require('../functions/gameRooms');

module.exports = {
    name: 'start',
    aliases: [],
    permissions: [],
    description: 'start the decrypto game! (normal / random)',
    async execute({ message, args, cmd, bot, logger, Discord }, DB) {

        /**
         *  init options object
         */
        let options = {
            gameMode: 'normal',
            autoAssign: false,
            // blueTeamFirstEncrypter: null, 
            // redTeamFirstEncrypter: null, 
        };

        // check if player set gamemode to random(default: normal)
        if (args[0] === 'random') options.gameMode = 'random';

        for (const arg of args) {
            if (!arg.startsWith('-')) continue;
            
                if (arg.endsWith('auto') || arg.endsWith('a')) options.autoAssign = true;
                // if (options.autoAssign && message.mentions.users)                 
                //     options.blueTeamFirstEncrypter = message.mentions.users.first();
                // if (options.autoAssign && message.mentions.users)                 
                //     options.redTeamFirstEncrypter = message.mentions.users.last();
        }



        /**
         * get player Data from DB and handle Promise object.
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

        // create a blue team role
        if (roleResult[0] === false) {
            // Create a new role with data and a reason
            let blueTeam;
            await message.guild.roles.create({
                data: {
                    name: `[${bot.config.name}]Blue Team`,
                    color: 'BLUE',
                    permissions: ['VIEW_CHANNEL'],
            },
                reason: 'TEAMS FOR DECRYPTO BOT TO PLAY GAME',
            })
                .then(newrole => blueTeam = newrole)
                .catch(console.error);
            gameData.gameRoles[0] = blueTeam.id;
            console.log(`Your role ${blueTeam.name}'s id is ${blueTeam.id}`)
        }  
        
        //create a red team role
        if (roleResult[1] === false) {
            // Create a new role with data and a reason
            let redTeam;
            await message.guild.roles.create({
                data: {
                    name: `[${bot.config.name}]Red Team`,
                    color: 'RED',
                    permissions: ['VIEW_CHANNEL'],
            },
                reason: 'TEAMS FOR DECRYPTO BOT TO PLAY GAME',
            })
                .then(newrole => redTeam = newrole)
                .catch(console.error);
            gameData.gameRoles[1] = redTeam.id;
            console.log(`Your role ${redTeam.name}'s id is ${redTeam.id}`)
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
            if (!key.startsWith('blueTeam') && !key.startsWith('redTeam')) return;

            let allow = {};
            if (key.startsWith('blueTeam'))
                allow = message.guild.roles.cache.get(gameData.gameRoles[0]);

            else if (key.startsWith('redTeam'))
                allow = message.guild.roles.cache.get(gameData.gameRoles[1]);
            
            
            await message.guild.channels.cache.get(gameData.gameRooms[rooms[key]])
                .updateOverwrite(
                    allow,
                    {
                        VIEW_CHANNEL: true
                    }
            )
        });

        gameData = await gameModel.findOneAndUpdate(
            { serverId: message.guild.id },
            { $set: { options: options } },{new: true}
        );

        // message.channel.send(`Game initialization completed.`);
        
        if (options.gameMode === 'random') 
            distribute.randomDistribute({ message, args, cmd, bot, logger, Discord }, gameData);
        if (options.gameMode === 'normal')
            distribute.normal({ message, args, cmd, bot, logger, Discord }, gameData);
        // distribute.test({ message, args, cmd, bot, logger, Discord }, gameData);
        
       /**
         * Sending `reset codes` message to both channels and show the current tokens each team
         */
        message.client.channels.cache.get(gameData.gameRooms[1]).send(`It's **${gameData.curEncrypterTeam} Team Encrypter** round!`);
        message.client.channels.cache.get(gameData.gameRooms[2]).send(`It's **${gameData.curEncrypterTeam} Team Encrypter** round!`);    
    },
};


