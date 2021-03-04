const gameModel = require('../models/gameSchema');
const playerModel = require('../models/playerSchema');

module.exports = {
    name: 'stop',
    aliases: ['end'],
    permissions: [],
    description: 'Quick stop the game and reset all elem includes players\' and server\'s',
    async execute({ message, args, cmd, bot, logger, Discord }, DB) {

        let gameData = await gameModel.findOneAndUpdate(
            {
                serverId: message.guild.id
            },
            {
                $set: {
                    "blueTeam.keywords": [],
                    "redTeam.keywords": [],
                    "blueTeam.intToken": 0,
                    "blueTeam.misToken": 0,
                    "redTeam.intToken": 0,
                    "redTeam.misToken": 0,
                    "blueTeam.encrypterId": '',
                    "redTeam.encrypterId": '',
                    "blueTeam.curCodes": [],
                    "redTeam.curCodes": [],
                    answerers: [],
                    curEncrypterTeam: 'BLUE',
                    curGames: 0,
                    onGame: false,
                }
            }
        )

        let playerData = await playerModel.findOneAndUpdate(
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
        )

        message.channel.send(`All elem has been reset.`);
    },
};
