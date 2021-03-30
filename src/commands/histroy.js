const gameModel = require('../models/gameSchema');

module.exports = {
    name: 'history',
    aliases: ['hs'],
    permissions: [],
    description: 'list descriptions history [red/blue]',
    async execute({ message, args, cmd, bot, logger, Discord }, DB) {

        if ((args[0] !== 'red' && args[0] !== 'blue') && args.length !== 0) return message.reply(`cannot recognize \'${args[0]}\' as a team`);

        let gameData = await gameModel.findOne({serverId: message.guild.id});

        const descriptions = {
            blueTeam: {
                _1: [],
                _2: [],
                _3: [],
                _4: [],
            },
            redTeam: {
                _1: [],
                _2: [],
                _3: [],
                _4: [],
            },
        };

        descriptions.blueTeam = gameData.blueTeam.descriptions;
        descriptions.redTeam = gameData.redTeam.descriptions;

        //create embed 
        const bt_descriptionEmbed = new Discord.MessageEmbed()
                .setColor('#31c5eb') //lightblue hex code
                .setTitle(`Blue Team Descriptions`)
                .addFields(
                    { name: '1', value: `${descriptions.blueTeam._1.join(', ')  || 'none'}`},
                    { name: '2', value: `${descriptions.blueTeam._2.join(', ')  || 'none'}`},
                    { name: '3', value: `${descriptions.blueTeam._3.join(', ')  || 'none'}`},
                    { name: '4', value: `${descriptions.blueTeam._4.join(', ')  || 'none'}`},
                )
                .setFooter(
                    `${bot.config.footer}`,
                );

        //create embed 
        const rt_descriptionEmbed = new Discord.MessageEmbed()
            .setColor('#f7526b') //lightred hex code
            .setTitle(`Red Team Descriptions`)
            .addFields(
                { name: '1', value: `${descriptions.redTeam._1.join(', ')  || 'none'}`},
                { name: '2', value: `${descriptions.redTeam._2.join(', ')  || 'none'}`},
                { name: '3', value: `${descriptions.redTeam._3.join(', ')  || 'none'}`},
                { name: '4', value: `${descriptions.redTeam._4.join(', ')  || 'none'}`},
            )
            .setFooter(
                `${bot.config.footer}`,
            );
        
        switch(args[0]) {
            case 'blue':
                message.channel.send(bt_descriptionEmbed);
                break;
            case 'red':
                message.channel.send(rt_descriptionEmbed);
                break;
            default:
                message.channel.send(bt_descriptionEmbed);
                message.channel.send(rt_descriptionEmbed);
        }
    },
};
