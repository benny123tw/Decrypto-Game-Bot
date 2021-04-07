const gameDB = require('../functions/gameDB');

module.exports = {
    name: 'report',
    aliases: ['rp'],
    permissions: [],
    description: 'Report someone to bot and launch a vote',
    async execute(options = {}, DB = {}) {
        const { message, args, cmd, bot, logger, Discord, language } = options;
        const { player, server } = DB;

        const mentions = message.mentions.members.array();

        if (!args.length || !mentions.length) return message.reply('Please mention at least one player!');

        if (!args[0].startsWith('<@!') || !args[0].endsWith('>'))
            return message.reply('Please mention player first');

        args.splice(0, mentions.length);

        if (args[0].startsWith('des'))
            // launch a vote for description
            message.channel.send(`<@${message.author.id}> report <@${mentions[0].user.id}> for Wrong Descriptions`);

        if (args[0].startsWith('ans'))
            // launch a vote for answer
            message.channel.send(`<@${message.author.id}> report <@${mentions[0].user.id}> for answer leak`);

        mentions.forEach(member => {
            console.log(`${member.user.username} was mention`)
        });   
        console.log(args)
    }
};

delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
