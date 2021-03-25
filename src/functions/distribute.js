const playerModel = require('../models/playerSchema');
const gameModel = require('../models/gameSchema');

/**
 * shuffle the array using random pointer
 * @param {Array} array 
 * @returns {Array}
 */
const shuffle = function shuffleArray(array) {
    let curId = array.length;
    // There remain elements to shuffle
    while (0 !== curId) {
      // Pick a remaining element
      let randId = Math.floor(Math.random() * curId);
      curId -= 1;
      // Swap it with the current element.
      let tmp = array[curId];
      array[curId] = array[randId];
      array[randId] = tmp;
    }
    return array;
}

const autoAssign = async (message, bot, Discord) => {
    let gameData = await gameModel.findOne({serverId: message.guild.id});

    gameData = await gameModel.findOneAndUpdate({serverId: message.guild.id},
        {$set:{"blueTeam.encrypterId": gameData.blueTeam.encryptersList[0], 
                "redTeam.encrypterId": gameData.redTeam.encryptersList[0]}}, {new: true})
        .then(async result =>{
            const bt_encrypter = new Discord.MessageEmbed().setColor('#e42643')
            .setTitle('Blue Team Encrypter')
            .setDescription(`${message.guild.members.cache.get(result.blueTeam.encrypterId).user.username} is current encrypter!`)
            .setThumbnail(message.guild.members.cache.get(result.blueTeam.encrypterId).user.avatarURL())
            .setFooter(
                `${bot.config.footer}`
            );

            const rt_encrypter = new Discord.MessageEmbed().setColor('#e42643')
            .setTitle('Red Team Encrypter')
            .setDescription(`${message.guild.members.cache.get(result.redTeam.encrypterId).user.username} is current encrypter!`)
            .setThumbnail(message.guild.members.cache.get(result.redTeam.encrypterId).user.avatarURL())
            .setFooter(
                `${bot.config.footer}`
            );


            message.client.channels.cache.get(result.gameRooms[1]).send(bt_encrypter);
            message.client.channels.cache.get(result.gameRooms[2]).send(rt_encrypter);

            const btFirstId = gameData.blueTeam.encryptersList.splice(0,1);
            gameData.blueTeam.encryptersList.push(btFirstId);

            const rtFirstId = gameData.redTeam.encryptersList.splice(0,1);
            gameData.redTeam.encryptersList.push(rtFirstId);

            await gameModel.findOneAndUpdate(
                {
                    serverId: message.guild.id,
                },
                {
                    $set: {
                        "blueTeam.encryptersList": gameData.blueTeam.encryptersList,
                        "redTeam.encryptersList": gameData.redTeam.encryptersList,
                    }
                }
            )
        });
}

/**
 * random team maker
 * react to join the team
 * $start random [participate quantity] to set max
 * @param {Object} serverObject 
 * @param {Object} gameData 
 * @param {Object} options
 */
const randomDistribute =  async ({ message, args, cmd, bot, logger, Discord }, gameData) => {
    // check arguments 2 is number
    if (isNaN(args[1])) return message.reply(`Please Enter the number`);
    if (!args[1]) return message.reply(`Please Enter hwo many players will join`);

    // init settings 
    const reactionFilter = (reaction, user) => reaction.emoji.name === '🤣';
    const blueTeamRole = gameData.gameRoles[0];
    const redTeamRole = gameData.gameRoles[1];
    const blueTeamEmoji = '🔹';
    const redTeamEmoji = '🔸';

    // join embed settings
    const joinEmbed = new Discord.MessageEmbed()
    .setColor('#e42643')
    .setTitle('React to join!')
    .addFields(
        { name: `Participate: ${args[1]}`, value: `none`, inline: false },
        { name: '\u200B', value: '\u200B' },
    )
    .setFooter(
        `${bot.config.footer}`,
    );

    /**
     * sending join embed message and create 3 event on collector
     */
    message.channel.send(joinEmbed)
        .then(msg => msg.react('🤣'))
        .then(async mReaction =>  {
            const collector = mReaction.message
            .createReactionCollector(reactionFilter, {
                max: args[1],
                dispose: true
            });

            // when someone react to this message do:
            collector.on('collect', reaction => {
                /**
                 *  assign join embed fields to embedlikefield
                 *  edit message when someone react 
                 */
                let embedLikeField = Object.assign({}, joinEmbed.fields[0]);
                embedLikeField.value = mReaction.users.cache.filter(user => !user.bot)
                    .map(user => user.username);

                // new embed join the new likefield
                const newEmbed = new Discord.MessageEmbed()
                .setColor('#e42643')
                .setTitle('React to join!')
                .addFields(
                    embedLikeField,
                    { name: '\u200B', value: '\u200B' },
                )
                .setFooter(
                    `${bot.config.footer}`,
                );
                reaction.message.edit(newEmbed);
            });

            collector.on('remove', reaction => {
                let embedLikeField = Object.assign({}, joinEmbed.fields[0]);

                // if reaction users map is empty then set value to none
                if (mReaction.users.cache.filter(user => !user.bot)
                .map(user => user.username).length === 0) {
                    embedLikeField.value = `none`;
                } else {
                    embedLikeField.value = mReaction.users.cache.filter(user => !user.bot)
                    .map(user => user.username);
                }

                // new embed join the new likefield
                const newEmbed = new Discord.MessageEmbed()
                .setColor('#e42643')
                .setTitle('React to join!')
                .addFields(
                    embedLikeField,
                    { name: '\u200B', value: '\u200B' },
                )
                .setFooter(
                    `${bot.config.footer}`,
                );
                reaction.message.edit(newEmbed);
            });

            collector.on('end', async reaction => {
                // shuffle the collector users ID
                let arr = mReaction.users.cache.filter(user => !user.bot)
                .map(user => `${user.id}`);
                arr = shuffle(arr);

                // split the array to distribute team
                let half_length = Math.ceil(arr.length / 2);
                let leftSide = arr.splice(0, half_length);

                // setting blue and red team arrray to soter user name
                let blueTeam = [];
                let redTeam = [];

                // forEach 2 teams add roles to them and store username
                arr.forEach(user => {
                    mReaction.message.guild.members.cache.get(user).roles.add(blueTeamRole);    
                    blueTeam.push(mReaction.message.guild.members.cache.get(user).user.username);
                });

                leftSide.forEach(user => {
                    mReaction.message.guild.members.cache.get(user).roles.add(redTeamRole);    
                    redTeam.push(mReaction.message.guild.members.cache.get(user).user.username);      
                });

                // shuffle encrypter for auto-assign order
                blueTeam = shuffle(blueTeam);
                redTeam = shuffle(redTeam);

                await gameModel.findOneAndUpdate(
                    {
                        serverId: message.guild.id,
                    },
                    {
                        $set: {
                            "blueTeam.encryptersList": arr,
                            "redTeam.encryptersList": leftSide
                        }
                    }
                );
                
                arr.forEach(async user => {
                    const respone = await playerModel.findOneAndUpdate(
                        {
                            playerId: user,
                        },
                        {
                            $set: {
                                team: 'BLUE',
                                onGame: true,
                                curServerId: message.guild.id,
                            },
                        },
                    );
                });

                leftSide.forEach(async user => {
                    const respone = await playerModel.findOneAndUpdate(
                        {
                            playerId: user,
                        },
                        {
                            $set: {
                                team: 'RED',
                                onGame: true,
                                curServerId: message.guild.id,
                            },
                        },
                    );
                });

                const newEmbed = new Discord.MessageEmbed()
                .setColor('#e42643')
                .setTitle('Final Result')
                .addFields(
                    { name: `${blueTeamEmoji} Blue Team`, value: `${blueTeam.join('\n') || `none`}` },
                    { name: `${redTeamEmoji} Red Team`, value: `${redTeam.join('\n') || `none`}` },
                    { name: '\u200B', value: '\u200B' },
                )
                .setFooter(
                    `${bot.config.footer}`,
                );
                message.channel.send(newEmbed);

                if (gameData.options.autoAssign)
                    autoAssign(message, bot, Discord);
            });
        })

        
}

const deleteMessage = (message) => {
    message.delete()
    .then(msg => console.log(`Deleted message from ${msg.author.username}`))
    .catch(console.error);
}

/**
 * using react role to distribute
 * @param {Object} serverObject
 * @param {Object} gameData
 * @param {Object} options
 */
const normal = async ({ message, args, cmd, bot, logger, Discord }, gameData) => {
    const channel = message.channel.id;
    const blueTeamRole = gameData.gameRoles[0];
    const redTeamRole = gameData.gameRoles[1];

    const blueTeamEmoji = '🔹';
    const redTeamEmoji = '🔸';

    let embed = new Discord.MessageEmbed()
        .setColor('#e42643')
        .setTitle('Choose your TEAM!')
        .setDescription(`\n\n${blueTeamEmoji} for blue team\n` 
            + `${redTeamEmoji} for red team`);

    let messageEmbed;
    await message.channel.send(embed)
    .then((msg) => {
        msg.react(blueTeamEmoji);
        msg.react(redTeamEmoji);
        messageEmbed = msg;
    });    

    let redTeam = [];
    let blueTeam = [];

    let redTeamID = [];
    let blueTeamID = [];

    bot.client.on('messageReactionAdd', async (reaction, user) => {
        reaction.fetch(reaction => {
            console.log(reaction)
        })
        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();
        if (user.bot) return;
        if (!reaction.message.guild) return;

        if (reaction.message.channel.id == channel && reaction.message.id === messageEmbed.id) {
            if (reaction.emoji.name === blueTeamEmoji) {
                
                let hasRedTeam = false;
                await reaction.message.guild.members.cache.get(user.id).roles.cache.each(role => {
                    if (role.id === gameData.gameRoles[1])
                        hasRedTeam = true;
                });

                if (hasRedTeam)
                    await reaction.users.remove(user);

                blueTeam.push(user.username);
                blueTeamID.push(user.id);
                await reaction.message.guild.members.cache.get(user.id).roles.add(blueTeamRole);
            }
            if (reaction.emoji.name === redTeamEmoji) {
                let hasBlueTeam = false;
                await reaction.message.guild.members.cache.get(user.id).roles.cache.each(role => {
                    if (role.id === gameData.gameRoles[0])
                        hasBlueTeam = true;
                });

                if (hasBlueTeam)
                    await reaction.users.remove(user);

                redTeam.push(user.username);
                redTeamID.push(user.id);
                await reaction.message.guild.members.cache.get(user.id).roles.add(redTeamRole);
            }
        } else {
            return;
        }
    });

    bot.client.on('messageReactionRemove', async (reaction, user) => {
        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();
        if (user.bot) return;
        if (!reaction.message.guild) return;

        if (reaction.message.channel.id == channel) {
            if (reaction.emoji.name === blueTeamEmoji) {
                blueTeam.splice(blueTeam.indexOf(user.username), 1);
                blueTeamID.splice(blueTeam.indexOf(user.id), 1);
                await reaction.message.guild.members.cache.get(user.id).roles.remove(blueTeamRole);
            }
            if (reaction.emoji.name === redTeamEmoji) {
                redTeam.splice(redTeam.indexOf(user.username), 1);
                redTeamID.splice(redTeam.indexOf(user.id), 1);
                await reaction.message.guild.members.cache.get(user.id).roles.remove(redTeamRole);
            }
        } else {
            return;
        }
    });



    setTimeout(async () => {
        console.log(blueTeam, redTeam)
        console.log(blueTeamID, redTeamID)

        // shuffle encrypter for auto-assign order
        blueTeam = shuffle(blueTeam);
        redTeam = shuffle(redTeam);

        const newEmbed = new Discord.MessageEmbed()
        .setColor('#e42643')
        .setTitle('Final Result')
        .addFields(
            { name: `${blueTeamEmoji} Blue Team`, value: `${blueTeam.join('\n') || `none`}` },
            { name: `${redTeamEmoji} Red Team`, value: `${redTeam.join('\n') || `none`}` },
            { name: '\u200B', value: '\u200B' },
        )
        .setFooter(
            `${bot.config.footer}`,
        );
        messageEmbed.delete();

        await gameModel.findOneAndUpdate(
            {
                server: message.guild.id
            },
            {
                $set: {
                    "blueTeam.encryptersList": blueTeamID,
                    "redTeam.encryptersList": redTeamID,
                }
            }
        );

        blueTeamID.forEach(async id => {
            const respone = await playerModel.findOneAndUpdate(
                {
                    playerId: id,
                },
                {
                    $set: {
                        team: 'BLUE',
                        onGame: true,
                        curServerId: message.guild.id,
                    },
                },
            );
        });

        redTeamID.forEach(async id => {
            const respone = await playerModel.findOneAndUpdate(
                {
                    playerId: id,
                },
                {
                    $set: {
                        team: 'RED',
                        onGame: true,
                        curServerId: message.guild.id,
                    },
                },
            );
        });
        message.channel.send(newEmbed);

        if (gameData.options.autoAssign)
            autoAssign(message, bot, Discord);
    }, 10000);
};

module.exports = {
    normal,
    randomDistribute,
}
