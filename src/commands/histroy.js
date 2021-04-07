const gameModel = require('../models/gameSchema');
const {teamObj} = require('../functions/gameRooms');

module.exports = {
    name: 'history',
    aliases: ['hs', 'current'],
    permissions: [],
    description: 'list descriptions history [red/blue] or list current descriptions',
    async execute(options = {}, DB = {}) {
        const { message, args, cmd, bot, logger, Discord, language } = options;
        const { player, server } = DB;

        if ((args[0] !== 'red' && args[0] !== 'blue') && args.length !== 0) return message.reply(language.error.history.teamParams(args[0]));

        let gameData = await gameModel.findOne({serverId: message.guild.id});

        if (cmd === 'current' && !gameData[teamObj[gameData.curEncrypterTeam].name].isDescribe) return message.reply(language.error.history.description);

        /**
         *  list current descriptions if current encrypter has sent it
         */
        if (cmd === 'current') {
            const obj = gameData[teamObj[gameData.curEncrypterTeam].name].descriptions;
            const curCodes = gameData[teamObj[gameData.curEncrypterTeam].name].curCodes;
            const resultArr = [];
            for( let code of curCodes) {
                // notice: this will pop gameData descriptions object
                resultArr.push(obj[`_${code}`].pop());
            }
            const msg = `1. ${resultArr[0]}\n2. ${resultArr[1]}\n3. ${resultArr[2]}`;
            return message.channel.send(msg);
        }

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
                .setColor(language.embed.descriptions.blue.color) //lightblue hex code
                .setTitle(language.embed.descriptions.blue.title)
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
            .setColor(language.embed.descriptions.red.color) //lightred hex code
            .setTitle(language.embed.descriptions.red.title)
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
