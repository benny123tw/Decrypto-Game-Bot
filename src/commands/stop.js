const gameModel = require('../models/gameSchema');
const playerModel = require('../models/playerSchema');

module.exports = {
    name: 'stop',
    aliases: ['end'],
    permissions: ["ADMINISTRATOR", "MANAGE_CHANNELS"],
    description: 'Quick stop the game and reset all elem includes players\' and server\'s',
    async execute({ message, args, cmd, bot, logger, Discord }, DB) {

        const optionsDefault = {
            gameMode: "normal",
            autoAssign: false,
        }

        const teamDefault = {
            keywords: [],
            intToken: 0,
            misToken: 0,
            encrypterId: "",
            curCodes: [],
        }

        let gameData = await gameModel.findOneAndUpdate(
            {
                serverId: message.guild.id
            },
            {
                $set: {
                    //blue
                    blueTeam: teamDefault,

                    //red
                    redTeam: teamDefault,

                    //server
                    answerers: [],
                    curEncrypterTeam: 'BLUE',
                    curGames: 0,
                    onGame: false,
                    options: optionsDefault,
                }
            },
            { 
                new: true,
            }
        )

        let playerData = await playerModel.updateMany(
            {
                curServerId: message.guild.id,
            },
            {
                $set: {
                    team: '',
                    onGame: false,
                    curServerId: '',
                }
            }
        );

        gameData.gameRoles.forEach(role => {
            if (bot.client.guilds.cache.get(DB.server.serverID).roles.cache.get(role) != undefined)
            bot.client.guilds.cache.get(DB.server.serverID).roles.cache.get(role).delete();
        });   

        gameData.gameRooms.forEach(room => {
            if (message.guild.channels.cache.get(room))
                message.guild.channels.cache.get(room).overwritePermissions([
                    {
                        id: message.guild.roles.everyone.id,
                        deny: ['VIEW_CHANNEL'],
                    },
                ]);
        });


        message.channel.send(`All elem has been reset.`);
    },
};
