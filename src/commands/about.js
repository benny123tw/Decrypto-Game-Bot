module.exports = {
    name: 'about',
    aliases: ['who'],
    permissions: [],
    description: 'about me',
    execute(options) {
        const { message, bot, Discord, logger, language} = options;
        const lanData = language?.commands[this.name];
        if (lanData === undefined) return ( message.reply('language pack loading failed.'),
            logger.error(`Can't find ${chalk.redBright(`language.commands[\`${this.name}\`]}`)}`));

        const aboutEmbed = new Discord.MessageEmbed()
            .setColor(language.color.primary)
            .setTitle(lanData.embed.title)
            .setURL('https://github.com/benny123tw')
            .setAuthor(
                `${bot.config.name}`,
                'https://th.bing.com/th/id/OIP.PkJS06lfE16iao8D95AuKQHaF_?pid=ImgDet&rs=1',
                'https://github.com/benny123tw',
            )
            .setThumbnail('https://th.bing.com/th/id/OIP.PkJS06lfE16iao8D95AuKQHaF_?pid=ImgDet&rs=1')
            .addFields(
                { name: lanData.embed.fields.author, value: `${bot.config.author}`, inline: true },
                // this can make a blank{ name: '\u200B', value: '\u200B' },
                { name: lanData.embed.fields.version, value: `v${bot.config.version}`, inline: true },
                {
                    name: lanData.embed.fields.description,
                    value: lanData.embed.fields.descriptionValue,
                },
            )
            // iso time stamp syntax yyyy-mm-ddThh:mm:ss.msZ (Zulu time)
            // UTC+8 => yyyy-mm-dd hh:mm:ss.ms+08
            .setTimestamp('2021-02-20 15:21:12.521+08') // sign the date I build this.
            .setFooter(
                `All works made with ❤️ by ${bot.config.author}`,
                'https://th.bing.com/th/id/OIP.PkJS06lfE16iao8D95AuKQHaF_?pid=ImgDet&rs=1',
            );
        message.channel.send(aboutEmbed);
    },
};
