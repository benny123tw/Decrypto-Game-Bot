const playerModel = require('../models/playerSchema');

module.exports = {
    name: 'scoreboard',
    aliases: ['sb'],
    permissions: [],
    description: 'show the scores',
    async execute({ message, args, cmd, bot, logger, Discord }, DB) {

        winrate = (( DB.player.wins / DB.player.total_Games) * 100).toFixed(2);

        //create embed 
        const scoreEmbed = new Discord.MessageEmbed()
                .setColor('#e42643')
                .setTitle(`Total ${DB.player.total_Games} Games`)
                .addFields(
                    { name: 'Wins', value: `${DB.player.wins}`, inline: true},
                    { name: `Loses`, value: `${DB.player.loses}`, inline: true },
                    { name: `W/L rate`, value: `${winrate}%`, inline: true },
                    { name: 'Cheats times', value: `${DB.player.cheats}` },
                    { name: '\u200B', value: '\u200B' },
                )
                .setImage(message.author.avatarURL())
                .setFooter(
                    `Copyright ©️ 2021 Decrypto. All right Reversed.`,
                );

        message.reply(scoreEmbed);        
    },
};
