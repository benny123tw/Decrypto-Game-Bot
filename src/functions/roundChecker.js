const chalk = require('chalk');
const playerModel = require('../models/playerSchema');
const {rooms, teamObj} = require('../functions/gameRooms');
const fs = require('fs');
const delay = require('../functions/delay');
const gameModel = require('../models/gameSchema');
const Discord = require('discord.js');
const name = 'roundChecker';

/**
 * passing server object and gameData, handle tie sitduation
 * caculate which team is winner
 * @param {Object} options 
 * @param {Object} DB 
 * @param {Object} gameData 
 */
const tie = async (options = {}, DB = {}, gameData) => {
    const { message, args, cmd, bot, logger, Discord, language } = options;
    const { player, server} = DB;
    const lanData = language?.functions[name];
    if (lanData === undefined) return ( message.reply('language pack loading failed.'),
        logger.error(`Can't find ${chalk.redBright(`language.functions[\`${name}\`]}`)}`));

    let blueTeamScore = gameData.blueTeam.intToken - gameData.blueTeam.misToken;
    let redTeamScore = gameData.redTeam.intToken - gameData.redTeam.misToken;

    if (blueTeamScore > redTeamScore) {
        // blue team win red team lose'
        logger.modules(`${chalk.blueBright(`Blue`)} Team win!`);
        logger.modules(`${chalk.redBright(`Red`)} Team lose!`);
        await playerModel.findOneAndUpdate(
            { curServerId: message.guild.id, team: 'BLUE' }, 
            { $inc: { total_Games: 1, wins: 1}});
        await playerModel.findOneAndUpdate(
            { curServerId: message.guild.id, team: 'RED' }, 
            { $inc: { total_Games: 1, loses: 1}});
        await reset(options, bot);
        return 1;
    }

    if (redTeamScore > blueTeamScore) {
        // blue team win red team lose'
        logger.modules(`${chalk.redBright(`Red`)} Team win!`);
        logger.modules(`${chalk.blueBright(`Blue`)} Team lose!`);
        await playerModel.findOneAndUpdate(
            { curServerId: message.guild.id, team: 'RED' }, 
            { $inc: { total_Games: 1, wins: 1}});
        await playerModel.findOneAndUpdate(
            { curServerId: message.guild.id, team: 'BLUE' }, 
            { $inc: { total_Games: 1, loses: 1}});
        await reset(options);
        return 2;
    }

    if (blueTeamScore === redTeamScore) {
        logger.modules(`${chalk.cyanBright(`Tie!`)}`);
        await reset(options);
        return 0;
    }
}

const reset = async (options = {}) => {

    const { message, bot, language } = options;
    const lanData = language?.functions[name];
    if (lanData === undefined) return ( message.reply('language pack loading failed.'),
        logger.error(`Can't find ${chalk.redBright(`language.functions[\`${name}\`]}`)}`));

    let gameData = await gameModel.findOne({serverId: message.guild.id});

    let onGame = true;

    if (gameData.curGames >= gameData.options.rounds) onGame = false;
    
    if (onGame) roundMessage(options, gameData.curGames);

    //unpin all bot's pinned message in both game rooms
    message.client.channels.cache.get(gameData.gameRooms[1]).messages.fetchPinned()
        .then(messages => messages.forEach(message => {
            if (message.author.id === bot.client.user.id) message.unpin()
        }))
        .catch(console.error); 

    message.client.channels.cache.get(gameData.gameRooms[2]).messages.fetchPinned()
        .then(messages => messages.forEach(message => {
            if (message.author.id === bot.client.user.id) message.unpin()
        }))
        .catch(console.error); 
    

    //reset all game elem 
    await gameModel.findOneAndUpdate(
        {
            serverId: message.guild.id,
        },
        {
            $set: {
                "onGame": onGame,
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
                "blueTeam.descriptions": {_1: [], _2: [], _3: [], _4: []},
                "redTeam.descriptions": {_1: [], _2: [], _3: [], _4: []},
                "blueTeam.isDescribe": false,
                "redTeam.isDescribe": false,
                answerers: [],
            }
        }
    )
    
    playBgm(message.guild, gameData);

    if (!onGame) {
        await playerModel.updateMany(
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
    }
}

const playBgm = async (guild, gameData) => {
    const audio_files = fs.readdirSync('./audio/End').filter(file => file.endsWith('.mp3'));
    const rand = Math.floor(Math.random() * audio_files.length);

    const connection = await guild.channels.cache.get(gameData.gameRooms[rooms.commonVoiceChannel]).join();

    await guild.channels.cache.get(gameData.gameRooms[rooms.blueTeamVoiceChannel]).members.forEach(member => {
        member.voice.setChannel(gameData.gameRooms[rooms.commonVoiceChannel])
    });
    await guild.channels.cache.get(gameData.gameRooms[rooms.redTeamVoiceChannel]).members.forEach(member => {
        member.voice.setChannel(gameData.gameRooms[rooms.commonVoiceChannel])
    });

    await delay(3000);

    await connection.play(`./audio/End/${audio_files[rand]}`, {volume: 0.5}).on('finish', async () => {
        const blue = await guild.channels.cache.get(gameData.gameRooms[rooms.commonVoiceChannel]).members.filter(member => gameData.blueTeam.encryptersList.includes(member.id));
        const red = await guild.channels.cache.get(gameData.gameRooms[rooms.commonVoiceChannel]).members.filter(member => gameData.redTeam.encryptersList.includes(member.id));
        await blue.forEach(member => member.voice.setChannel(gameData.gameRooms[rooms.blueTeamVoiceChannel]));
        await red.forEach(member => member.voice.setChannel(gameData.gameRooms[rooms.redTeamVoiceChannel]));
    });
}

const roundMessage = (options = {}, round = 0) => {
    const { message, bot, language } = options;
    const lanData = language?.functions[name];
    if (lanData === undefined) return ( message.reply('language pack loading failed.'),
        logger.error(`Can't find ${chalk.redBright(`language.functions[\`${name}\`]}`)}`));

    const newRoundEmbed = new Discord.MessageEmbed()
    .setColor(lanData.embed.round.color)
    .setTitle(lanData.embed.round.title(round))
    .setFooter(
        `${bot.config.footer}`,
    );

    message.client.channels.cache.get(gameData.gameRooms[rooms.blueTeamTextChannel]).send(newRoundEmbed);
    message.client.channels.cache.get(gameData.gameRooms[rooms.redTeamTextChannel]).send(newRoundEmbed);
}

const gameOverMessage = (options, gameData, team) => {
    const { message, bot, language } = options;
    const lanData = language?.functions[name];
    if (lanData === undefined) return ( message.reply('language pack loading failed.'),
        logger.error(`Can't find ${chalk.redBright(`language.functions[\`${name}\`]}`)}`));
    
    const gameOverEmbed = new Discord.MessageEmbed()
    .setColor(lanData.embed.gameOver.color(team))
    .setTitle(lanData.embed.gameOver.title)
    .setDescription(lanData.embed.gameOver.description(team))
    .setFooter(
        `${bot.config.footer}`,
    );

    message.client.channels.cache.get(gameData.gameRooms[rooms.blueTeamTextChannel]).send(gameOverEmbed);
    message.client.channels.cache.get(gameData.gameRooms[rooms.redTeamTextChannel]).send(gameOverEmbed);
}

module.exports = {
    name: "roundChecker",
    tie,
    reset,
    playBgm,
    roundMessage,
    gameOverMessage
}