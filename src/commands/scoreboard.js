const playerModel = require('../models/playerSchema');

module.exports = {
    name: 'scoreboard',
    aliases: ['sb'],
    permissions: [],
    description: 'show the scores',
    async execute({ message, args, cmd, bot, logger, Discord }, DB) {

        //create embed 
        const scoreEmbed = new Discord.MessageEmbed()
                .setColor('#e42643')
                .setTitle(`Total ${DB.player.total_Games} Games`)
                .addFields(
                    { name: 'Wins', value: `${DB.player.wins}`, inline: true},
                    { name: `Loses`, value: `${DB.player.loses}`, inline: true },
                    { name: 'Cheats times', value: `${DB.player.cheats}` },
                    { name: '\u200B', value: '\u200B' },
                )
                .setFooter(
                    `All works made with ❤️ by ${bot.config.author}`,
                );

        message.reply(scoreEmbed);        
    },
};
