const serverModel = require('../models/serverSchema');
const fs = require('fs');

module.exports = {
    name: 'language',
    aliases: ['lan'],
    permissions: ["ADMINISTRATOR"],
    description: 'Change server language setting',
    async execute(options) {
        const { message, args, bot, Discord, language } = options;
        const lanData = language?.commands[this.name];
        if (lanData === undefined) return ( message.reply('language pack loading failed.'),
            logger.error(`Can't find ${chalk.redBright(`language.commands[\`${this.name}\`]}`)}`));

        if (!args[0]) return message.channel.send(new Discord.MessageEmbed()
                        .setColor(language.color.primary)
                        .setTitle(lanData.embed.current)
                        .setFooter(bot.config.footer));

        const keys = Object.keys(languageArr)
        for (let i=0; i < keys.length; i++) 
            if (languageArr[keys[i]].includes(args[0].toLowerCase())) {
                args[0] = keys[i];
                break;             
            }

        const lan_files = fs.readdirSync('./language/js'); // start from where index.js is 
        if (!lan_files.includes(`${args[0]}.js`)) return message.reply(lanData.param(args[0]));
        const serverData = await serverModel.findOneAndUpdate(
            {serverID: message.guild.id},
            { $set: { language: args[0]} }, {new: true});
        const newlanguage = bot.Language[serverData.language || 'en-US'];

        const lanEmbed = new Discord.MessageEmbed()
            .setColor(newlanguage.commands[this.name].embed.color)
            .setTitle(newlanguage.commands[this.name].embed.setting)
            .setFooter(
                bot.config.footer);
        message.channel.send(lanEmbed);
    },
};

const languageArr = {
    'en-US': ['english',  'en', '英文', '英語', '英语'],
    'zh-CN': ['chinese', 'cn', 'zh', 'zhongwen', 'zw', 
    '中文', '簡體中文', '簡中','简体中文', '简中'],
    'zh-TW': ['繁體中文', '正體中文', '台灣', '繁中', 'tw',
    'zh-tw'],
}
