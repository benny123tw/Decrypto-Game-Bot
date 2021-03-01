module.exports = {
    name: 'about',
    aliases: ['who'],
    permissions: [],
    description: '關於我',
    execute({ message, args, cmd, bot, logger, Discord }, DB) {
        const aboutEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('關於我')
            .setURL('https://github.com/benny123tw')
            .setAuthor(
                `${bot.config.name}`,
                'https://i.imgur.com/2eXfQti.png',
                'https://github.com/benny123tw',
            )
            .setThumbnail('https://i.imgur.com/2eXfQti.png')
            .addFields(
                { name: '作者', value: `${bot.config.author}`, inline: true },
                // this can make a blank{ name: '\u200B', value: '\u200B' },
                { name: '版本', value: `v${bot.config.version}`, inline: true },
                {
                    name: '描述',
                    value: `五分鐘做出來的機器人，兩天固定架構`,
                },
            )
            .setTimestamp('2021-02-20T07:21:12.521Z') // sign the date I build this.
            .setFooter(
                `All works made with ❤️ by ${bot.config.author}`,
                'https://i.imgur.com/2eXfQti.png',
            );
        message.channel.send(aboutEmbed);
    },
};
