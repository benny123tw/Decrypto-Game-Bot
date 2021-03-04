module.exports = {
    name: 'about',
    aliases: ['who'],
    permissions: [],
    description: 'about me',
    execute({ message, args, cmd, bot, logger, Discord }, DB) {
        const aboutEmbed = new Discord.MessageEmbed()
            .setColor('#e42643')
            .setTitle('關於我')
            .setURL('https://github.com/benny123tw')
            .setAuthor(
                `${bot.config.name}`,
                'https://th.bing.com/th/id/OIP.PkJS06lfE16iao8D95AuKQHaF_?pid=ImgDet&rs=1',
                'https://github.com/benny123tw',
            )
            .setThumbnail('https://th.bing.com/th/id/OIP.PkJS06lfE16iao8D95AuKQHaF_?pid=ImgDet&rs=1')
            .addFields(
                { name: '作者', value: `${bot.config.author}`, inline: true },
                // this can make a blank{ name: '\u200B', value: '\u200B' },
                { name: '版本', value: `v${bot.config.version}`, inline: true },
                {
                    name: '描述',
                    value: `這是一個做到快結束才發現規則搞錯又要大改DB的慘案`,
                },
            )
            .setTimestamp('2021-02-20T07:21:12.521Z') // sign the date I build this.
            .setFooter(
                `All works made with ❤️ by ${bot.config.author}`,
                'https://th.bing.com/th/id/OIP.PkJS06lfE16iao8D95AuKQHaF_?pid=ImgDet&rs=1',
            );
        message.channel.send(aboutEmbed);
    },
};
