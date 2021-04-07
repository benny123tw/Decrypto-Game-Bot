const playerModel = require('../models/playerSchema');

module.exports = {
    name: 'scoreboard',
    aliases: ['sb'],
    permissions: [],
    description: 'Show the career',
    async execute(options = {}, DB = {}) {
        const { message, args, cmd, bot, logger, Discord, language } = options;
        const { player, server } = DB;

        winrate = (( player.wins / player.total_Games) * 100).toFixed(2);

        //create embed 
        const scoreEmbed = new Discord.MessageEmbed()
                .setColor('#e42643')
                .setTitle(`Total ${player.total_Games} Games`)
                .addFields(
                    { name: 'Wins', value: `${player.wins}`, inline: true},
                    { name: `Loses`, value: `${player.loses}`, inline: true },
                    { name: `W/L rate`, value: `${winrate}%`, inline: true },
                    { name: 'Cheating times', value: `${player.cheats}` },
                )
                .setImage(message.author.avatarURL())
                .setFooter(
                    `${bot.config.footer}`,
                );

        message.reply(scoreEmbed);        
    },
};
