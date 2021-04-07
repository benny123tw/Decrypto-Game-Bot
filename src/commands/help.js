module.exports = {
    name: 'help',
    aliases: ['h'],
    permissions: [],
    description: 'help command',
    async execute(options = {}, DB = {}) {
        const { message, args, cmd, bot, logger, Discord, language } = options;
        const { player, server} = DB;

        const helpEmbed = new Discord.MessageEmbed()
            .setColor('#e42643')
            .setTitle('All Commands')
            .setDescription(`Prefix: \`${server.prefix}\``)
            .setThumbnail('https://th.bing.com/th/id/OIP.PkJS06lfE16iao8D95AuKQHaF_?pid=ImgDet&rs=1')
            .setFooter(
                `All works made with ❤️ by ${bot.config.author}`,
                'https://th.bing.com/th/id/OIP.PkJS06lfE16iao8D95AuKQHaF_?pid=ImgDet&rs=1'
            );
        bot.commands.forEach(command => {
            helpEmbed.addField(`\`${server.prefix}${command.name}\``, `${command.description}`, false);
        });        
        message.channel.send(helpEmbed);
    },
};
