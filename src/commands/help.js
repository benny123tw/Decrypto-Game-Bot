const chalk = require('chalk');

module.exports = {
    name: 'help',
    aliases: ['h'],
    permissions: [],
    description: 'help command',
    async execute(options = {}, DB = {}) {
        const { message, args, cmd, bot, logger, Discord, language } = options;
        const { player, server} = DB;
        const lanData = language?.commands[this.name];
        if (lanData === undefined) return ( message.reply('language pack loading failed.'),
            logger.error(`Can't find ${chalk.redBright(`language.commands[\`${this.name}\`]}`)}`));

        const helpEmbed = new Discord.MessageEmbed()
            .setColor(lanData.embed.color)
            .setTitle(lanData.embed.title)
            .setDescription(lanData.embed.description(server.prefix))
            .setThumbnail('https://th.bing.com/th/id/OIP.PkJS06lfE16iao8D95AuKQHaF_?pid=ImgDet&rs=1')
            .setFooter(
                `All works made with ❤️ by ${bot.config.author}`,
                'https://th.bing.com/th/id/OIP.PkJS06lfE16iao8D95AuKQHaF_?pid=ImgDet&rs=1'
            );
        bot.commands.forEach(command => {
            helpEmbed.addField(`\`${server.prefix}${command.name}\``, `${language.commands[command.name].description || command.description || 'none'}`, false);
        });        
        message.channel.send(helpEmbed);
    },
};
