const chalk = require('chalk');

// handle game rooms index in db
const rooms = {
    root: 0,
    blueTeamTextChannel: 1,
    redTeamTextChannel: 2,
    blueTeamVoiceChannel: 3,            
    commonVoiceChannel: 4,
    redTeamVoiceChannel: 5
}

const channelCreate = async (name, options = {},{message, logger}) => {

    let {
        type,
        topic,
        nsfw,
        bitrate,
        userLimit,
        parent,
        allow,
        permissionOverwrites,
        position,
        rateLimitPerUser,
        reason,
      } = options;

     permissionOverwrites = [
        {
            id: message.guild.roles.everyone.id,
            deny: ['VIEW_CHANNEL'],
        }
    ];

    if (allow.length === 0) return console.error('Please input allow param');

    if (typeof allow === 'string') {
        if (allow.includes(','))
            allow = allow.split(',');
        else 
            allow = [allow];
    }

    allow.forEach( _id => {
        const allowPermissions = {
            id: _id,
            allow: ['VIEW_CHANNEL'],
        }    
        permissionOverwrites.push(allowPermissions);
    })

    // Create a new parent category and set to private
    let channelId = '';
    await message.guild.channels.create(name, {
        type: `${type}`,
        position: 1,
        permissionOverwrites: permissionOverwrites,
        parent: parent || null,
    }).then(channel => {
        channelId = channel.id;
    }).catch(error => logger.error('Root: ' + chalk.red(error)));

    return channelId;
}

module.exports = {
    rooms,
    channelCreate
}