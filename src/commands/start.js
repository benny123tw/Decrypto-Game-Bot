const chalk = require('chalk');
const gameDB = require('../functions/gameDB');
const gameModel = require('../models/gameSchema');
const distribute = require('../functions/distribute');

module.exports = {
    name: 'start',
    aliases: [],
    permissions: [],
    description: 'start the decrypto game!',
    async execute({ message, args, cmd, bot, logger, Discord }, DB) {
        /**
         * get player Data from DB and handle Promise object.
         */
        let gameData;
        await gameDB(bot, logger, message)
            .then(result => (gameData = result))
            .catch(err => console.log(err));

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
         * gameGooms @param {'CategoryID', 'TEAM1ID', 'TEAM2ID'}
         * Categorry
         *      |_blueteam
         *      |_redteam
         */
        let roomResult = [false, false, false];
        await message.guild.fetch()
            .then(guild => {
                guild.channels.cache.forEach(channel => {
                    if (channel.id === gameData.gameRooms[0])
                        roomResult[0] = true;
                    if (channel.id === gameData.gameRooms[1])
                        roomResult[1] = true;
                    if (channel.id === gameData.gameRooms[2])
                        roomResult[2] = true;
                })
            })
            .catch(console.error);

        let newCategory; //get the new category object
        if (!roomResult[0]) {
            // Create a new parent category and set to private
            await message.guild.channels.create('Decrypto Game Rooms', {
                type: 'category',
                position: 1,
                permissionOverwrites: [
                    {
                    id: message.guild.roles.everyone.id,
                    deny: ['VIEW_CHANNEL'],
                }
                ]
            }).then(channel => {
                newCategory = channel;
                gameData.gameRooms[0] = channel.id;
            }).catch(error => logger.error(chalk.red(error)));
        }
        
        if (!roomResult[1]) {
            //create blue team channel and set to private 
            await message.guild.channels.create('Blue Team', {
                type: 'text',
                position: 1,
                permissionOverwrites: [
                    {
                        id: message.guild.roles.everyone.id,
                        deny: ['VIEW_CHANNEL'],
                    },
                    {
                        id: gameData.gameRoles[0],
                        allow: ['VIEW_CHANNEL'],
                    }
                ],
                parent: newCategory.id,
            }).then(channel => {
                gameData.gameRooms[1] = channel.id;
            }).catch(error => logger.error(chalk.red(error)));
        }
        
        if (!roomResult[2]) {
            //create red team and set to private
            await message.guild.channels.create('Red Team', {
                type: 'text',
                position: 1,
                permissionOverwrites: [
                    {
                        id: message.guild.roles.everyone.id,
                        deny: ['VIEW_CHANNEL'],
                    },
                    {
                        id: gameData.gameRoles[1],
                        allow: ['VIEW_CHANNEL'],
                    }
                ],
                parent: newCategory.id,
            }).then(channel => {
                gameData.gameRooms[2] = channel.id;
            }).catch(error => logger.error(chalk.red(error)));
        }
        
        // update new rooms to DB
        if(roomResult.includes(false))
            await gameModel.findOneAndUpdate({
                serverId: message.guild.id
            }, {
                    $set: {
                        gameRooms: gameData.gameRooms,
                    },            
            }).then(logger.info(chalk.greenBright(`Update gameRooms ${chalk.cyan(gameData.gameRooms)} to database`)))
            .catch(error => logger.error(chalk.red(error)));

        // message.channel.send(`Game initialization completed.`);
        
        if (args[0] === 'random')
            distribute.randomDistribute({ message, args, cmd, bot, logger, Discord }, gameData);
        if (!args[0] || !isNaN(args[0]))
            distribute.distribute({ message, args, cmd, bot, logger, Discord }, gameData);
        // distribute.test({ message, args, cmd, bot, logger, Discord }, gameData);
        
        
    },
};
