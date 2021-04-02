const gameModel = require('../../models/gameSchema');

module.exports = {
    name: 'describe',
    aliases: ['d', 'dec'],
    permissions: [],
    description: 'Send Descriptions to channels via bot',
    async execute({ message, args, cmd, bot, logger, Discord }, {user}) {

        if (!user.onGame) return message.reply('You are not in any games');

        let gameData = await gameModel.findOne({serverId: user.curServerId});

        if (gameData === null || gameData === undefined) return message.reply('Game not found');

        if (gameData.curEncrypterTeam !== user.team || (gameData.blueTeam.encrypterId !== user.playerId
            && gameData.redTeam.encrypterId !== user.playerId)) return message.reply('You are not encrypter!!');

        // split message 
        if (args.length > 3 || message.content.includes(',')) {
            let argsArr = [];
            let msgArr = message.content.slice(1+cmd.length).split(',');
            msgArr.forEach(msg => {
                let newMsg = msg.split(/ +/);
                newMsg[0] === '' ? newMsg.shift() : newMsg;
                argsArr.push(newMsg.join(' '));
            })
            args = argsArr;
        }            

        if (args.length === 0 || args.length !== 3) return message.reply('Please enter 3 descriptions!');

        const teamObj = {
            BLUE: 'blueTeam',
            RED: 'redTeam'
        }

        const descriptions = gameData[teamObj[gameData.curEncrypterTeam]].descriptions;
        const codes = gameData[teamObj[gameData.curEncrypterTeam]].curCodes;

        // test if descriptions is repeat
        let index = 0;
        const pass = Object.values(descriptions).every(codeArr => !codeArr.includes(args[index++]));        
        if (!pass) return message.reply('Do not enter same descriptions'); // send history descriptions

        index = 0;
        codes.forEach( code => {
            descriptions[`_${code}`].push(args[index]);
            index++;
        });

        console.log(codes)
        console.log(descriptions)
        console.log(args)

        if (gameData.curEncrypterTeam === 'BLUE')
            await gameModel.findOneAndUpdate({serverId: user.curServerId},
                {$set: {"blueTeam.descriptions": descriptions, "blueTeam.isDescribe": true}});
        
        if (gameData.curEncrypterTeam === 'RED')
            await gameModel.findOneAndUpdate({serverId: user.curServerId},
                {$set: {"redTeam.descriptions": descriptions, "redTeam.isDescribe": true}});

        const guild = await message.client.guilds.fetch(gameData.serverId, true);
        const rooms = gameData.gameRooms.splice(1,2);
        rooms.forEach(room => {
            const channel = guild.channels.cache.get(room); // don't know why fetch can't work
            let msg = `1. ${args[0]}\n2. ${args[1]}\n3. ${args[2]}`;
            channel.send(msg);
        });
    },
};
