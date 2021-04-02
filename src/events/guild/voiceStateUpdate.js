const gameModel = require('../../models/gameSchema');
const {rooms, teamObj} = require('../../functions/gameRooms');

module.exports = async (bot, Discord, logger, oldState, newState) => {
    const gameData = await gameModel.findOne({serverId: newState.guild.id});

    // if (newState.channelID !== gameData.gameRooms[rooms.commonVoiceChannel]) return;
    
    // return mute event
    if (oldState.channel === newState.channel) return;

    // return mute event 
    if (oldState.mute && oldState.mute !== newState.mute) return;

    // call checker
    return encrypterChecker(oldState, newState, gameData);
    

    // connect to voice channel
    if (!oldState.channel) {
        return newState.guild.channels.cache.get('811827796510113813').send('Connected!');
    }        

    // disconnect from voice channel
    if (!newState.channel) {
        return newState.guild.channels.cache.get('811827796510113813').send('Disconnected!');
    }
    
    // join in another voice channel
    if (oldState.channel !== newState.channel) {
        return newState.guild.channels.cache.get('811827796510113813').send('Join another channel!');
    }     
    
};

const encrypterChecker = async (oldState, newState, gameData) => {
    
    // if user disconnect from voice channel point to oldState
    const state = !newState.channel ? oldState : newState;

    // find encrypter
    const encrypter = await state.guild.members.fetch(gameData[teamObj[gameData.curEncrypterTeam]].encrypterId);
    
    // check if encrypter is in voice channel 
    if (!encrypter.voice.channel) return;

    // if encrypter try to join another channels disconnect him
    if (newState.channel && newState.id === gameData[teamObj[gameData.curEncrypterTeam]].encrypterId) {
        if (newState.channel.id !== gameData.gameRooms[rooms.commonVoiceChannel]) 
            return encrypter.voice.setChannel(gameData.gameRooms[rooms.commonVoiceChannel]);
    }

    // check if there have 2 team player in comomon voice channel
    const membersID = state.guild.channels.cache.get(gameData.gameRooms[rooms.commonVoiceChannel]).members.map(member => member.id);
    let checker = {blue: false, red: false};
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
        
    // mute handler
    encrypter.voice.setMute(checker.blue && checker.red ? false : true);  
}
