const chalk = require('chalk');
const gameModel = require('../../models/gameSchema');
const {rooms, teamObj} = require('../../functions/gameRooms');
const { check } = require('prettier');

module.exports = async (bot, Discord, logger, oldState, newState) => {
    console.log('connected')
    const gameData = await gameModel.findOne({serverId: newState.guild.id});

    if (newState.channelID !== gameData.gameRooms[rooms.commonVoiceChannel]) return;

    if (!oldState.channel) {
        encrypterChecker(oldState, newState, gameData);
        return newState.guild.channels.cache.get('811827796510113813').send('Connected!');
    }            
        
    

    if (!newState.channel) {
        encrypterChecker(oldState, newState, gameData);
        return newState.guild.channels.cache.get('811827796510113813').send('Disconnected!');
    }
    
    if (oldState.channel !== newState.channel) {
        return newState.guild.channels.cache.get('811827796510113813').send('Join another channel!');
    }     
    
};

const encrypterChecker = (oldState, newState, gameData) => {

    if (newState.id !== gameData[teamObj[gameData.curEncrypterTeam]].encrypterId) return;

    const membersID = [];
    newState.channel.members.array().forEach(member => membersID.push(member.id));
    let checker = {blue: false, red: true};
    for (let id of gameData.blueTeam.encryptersList) {
        if (membersID.includes(id)) {
            checker.blue = true;
            break;
        }
    }
    for (let id of gameData.redTeam.encryptersList) {
        if (membersID.includes(id)) {
            checker.red = true;
            break;
        }
    }

    if (checker.blue && checker.red)
        // newState.channel.members.fetch(gameData[gameData[teamObj[gameData.curEncrypterTeam]].encrypterId]).voice.setMute(false);
        console.log(newState.channel.members.get(gameData[teamObj[gameData.curEncrypterTeam].encrypterId]))
    else
    // newState.channel.members.fetch(gameData[gameData[teamObj[gameData.curEncrypterTeam]].encrypterId]).voice.setMute(true);
    console.log(newState.channel.members.get(gameData[teamObj[gameData.curEncrypterTeam]].encrypterId))

}
