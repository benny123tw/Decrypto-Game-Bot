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

/**
 * command for testing shuffle 
 * @param {Object} ServerObject 
 * @param {Object} gameData 
 */
const test = ({ message, args, cmd, bot, logger, Discord }, gameData) => {
    let arr = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'];
    arr = shuffle(arr);
    let half_length = Math.ceil(arr.length / 2);
    let leftSide = arr.splice(0, half_length);
    message.channel.send(`Team 1 \n ${arr}`);
    message.channel.send(`Team 2 \n ${leftSide}`);
}

/**
 * random team maker
 * react to join the team
 * $start random [participate quantity] to set max
 * @param {Object} serverObject 
 * @param {Object} gameData 
 */
const randomDistribute =  async ({ message, args, cmd, bot, logger, Discord }, gameData ) => {
    // check arguments 2 is number
    if (isNaN(args[1])) return message.reply(`Please Enter the number`);
    if (!args[1]) return message.reply(`Please Enter hwo many players will join`);

    // init settings 
    const reactionFilter = (reaction, user) => reaction.emoji.name === '🤣';
    const blueTeamRole = gameData.gameRoles[0];
    const redTeamRole = gameData.gameRoles[1];

    // join embed settings
    const joinEmbed = new Discord.MessageEmbed()
    .setColor('#e42643')
    .setTitle('React to join!')
    .addFields(
        { name: `參與人數 ${args[1]} 位`, value: `none`, inline: false },
        { name: '\u200B', value: '\u200B' },
    )
    .setFooter(
        `All works made with ❤️ by ${bot.config.author}`,
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
                    `All works made with ❤️ by ${bot.config.author}`,
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
                    `All works made with ❤️ by ${bot.config.author}`,
                );
                reaction.message.edit(newEmbed);
            });

            collector.on('end', reaction => {
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
                
                message.channel.send(`Team Blue \n${blueTeam.join('\n')}`);
                message.channel.send(`Team Red \n${redTeam.join('\n')}`);
            });
        })

        
}

const normal = async ({ message, args, cmd, bot, logger, Discord }, gameData ) => {
    const blueTeamRole = gameData.gameRoles[0];
    const redTeamRole = gameData.gameRoles[1];

    const blueTeamEmoji = '😄';
    const redTeamEmoji = '😠';

    const joinEmbed = new Discord.MessageEmbed()
    .setColor('#e42643')
    .setTitle('React to join!')
    .setDescription(`\n\n${blueTeamEmoji} for blue team\n` 
            + `${redTeamEmoji} for red team`)
    .addFields(
        { name: `參與人數 ${args[0]} 位`, value: `none`, inline: false },
        { name: '\u200B', value: '\u200B' },
    )
    .setFooter(
        `All works made with ❤️ by ${bot.config.author}`,
    );

    message.channel.send(joinEmbed)
        .then(async msg => {
            await msg.react(blueTeamEmoji)
            await msg.react(redTeamEmoji)
            // console.log(msg.reactions.cache)
            const twoReactionFilter = (reaction, user) => reaction.emoji.name = redTeamEmoji || blueTeamEmoji;
                const twoCollector = msg
                .createReactionCollector(twoReactionFilter, {
                    max: args[1],
                    dispose: true
                    });

                twoCollector.on('collect', reaction => {
                    let embedLikeField = Object.assign({}, joinEmbed.fields[0]);
                    console.log(msg.reactions.cache.users.cache.filter(user => !user.bot)
                    .map(user => user.username))
                    embedLikeField.value = msg.reactions.cache.users.cache.filter(user => !user.bot)
                        .map(user => user.username);

                    // new embed join the new likefield
                    const newEmbed = new Discord.MessageEmbed()
                    .setColor('#e42643')
                    .setTitle('React to join!')
                    .setDescription(`\n\n${blueTeamEmoji} for blue team\n` 
                    + `${redTeamEmoji} for red team`)
                    .addFields(
                        embedLikeField,
                        { name: '\u200B', value: '\u200B' },
                    )
                    .setFooter(
                        `All works made with ❤️ by ${bot.config.author}`,
                    );
                    reaction.message.edit(newEmbed);                        
                })

                twoCollector.on('remove', reaction => {
                    let embedLikeField = Object.assign({}, joinEmbed.fields[0]);
                    console.log(msg.reactions.cache.users.cache.filter(user => !user.bot)
                    .map(user => user.username))
                    embedLikeField.value = msg.reactions.cache.users.cache.filter(user => !user.bot)
                        .map(user => user.username);

                    // new embed join the new likefield
                    const newEmbed = new Discord.MessageEmbed()
                    .setColor('#e42643')
                    .setTitle('React to join!')
                    .setDescription(`\n\n${blueTeamEmoji} for blue team\n` 
                    + `${redTeamEmoji} for red team`)
                    .addFields(
                        embedLikeField,
                        { name: '\u200B', value: '\u200B' },
                    )
                    .setFooter(
                        `All works made with ❤️ by ${bot.config.author}`,
                    );
                    reaction.message.edit(newEmbed);
                })

                twoCollector.on('end', reaction => {
                    
                })
                let blueTeam = [];
                let redTeam = [];
                msg.reactions.cache.forEach(async r => {
                const reactionFilter = (reaction, user) => reaction.emoji.name = r.emoji.name;
                const collector = msg
                .createReactionCollector(reactionFilter, {
                    max: args[1],
                    dispose: true
                });

                // when someone react to this message do:
                collector.on('collect', reaction => {
                    console.log(`clicked`)
                });

                collector.on('remove', reaction => {
                    
                });
            })
        })
}

const deleteMessage = (message) => {
    message.delete()
    .then(msg => console.log(`Deleted message from ${msg.author.username}`))
    .catch(console.error);
}

// using react role to distribute
const distribute = async ({ message, args, cmd, bot, logger, Discord }, gameData ) => {
    const channel = message.channel.id;
    const blueTeamRole = gameData.gameRoles[0];
    const redTeamRole = gameData.gameRoles[1];

    const blueTeamEmoji = '💙';
    const redTeamEmoji = '❤️';

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
                await reaction.message.guild.members.cache.get(user.id).roles.remove(blueTeamRole);
            }
            if (reaction.emoji.name === redTeamEmoji) {
                redTeam.splice(redTeam.indexOf(user.username), 1);
                await reaction.message.guild.members.cache.get(user.id).roles.remove(redTeamRole);
            }
        } else {
            return;
        }
    });

    

    setTimeout(() => {
        console.log(blueTeam, redTeam)
        const newEmbed = new Discord.MessageEmbed()
        .setColor('#e42643')
        .setTitle('Final Result')
        .addFields(
            { name: `${blueTeamEmoji} Blue Team`, value: `${blueTeam.join('\n') || `none`}` },
            { name: `${redTeamEmoji} Red Team`, value: `${redTeam.join('\n') || `none`}` },
            { name: '\u200B', value: '\u200B' },
        )
        .setFooter(
            `All works made with ❤️ by ${bot.config.author}`,
        );
        messageEmbed.delete();
        return message.channel.send(newEmbed)
    }, 5000);
};

module.exports = {
    distribute,
    normal,
    randomDistribute,
    test,
}
