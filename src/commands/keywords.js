const gameDB = require('../functions/gameDB');
const gameModel = require('../models/gameSchema');
const chalk = require('chalk');

module.exports = {
    name: 'keywords',
    aliases: ['keyword', 'list keywords', 'kw'],
    permissions: ['ADMINISTRATOR', 'MANAGE_CHANNELS'],
    description: 'Keywords Query, Update, Delete, Add, \`$help keywords\` for more help',
    async execute(options = {}, DB = {}) {
        const { message, args, cmd, bot, logger, Discord, language } = options;
        const { player, server } = DB;
        const lanData = language?.commands[this.name];
        if (lanData === undefined) return ( message.reply('language pack loading failed.'),
            logger.error(`Can't find ${chalk.redBright(`language.commands[\`${this.name}\`]}`)}`));
        
        /**
         * get player Data from DB and handle Promise object.
         */
        let gameData;
        await gameDB(bot, logger, message)
            .then(result => (gameData = result))
            .catch(err => console.log(err));
        let arr = gameData.keywords;

        /**
         * using $kw a keyword (index) to add/insert keyword
         */
        const addAliases = ['add', 'a'];
        if (addAliases.includes(args[0])) {
            if (!args[1]) return message.reply(lanData.error.syntax.add(server.prefix));
            
            if (args[2])
                arr.splice(args[2], 0, args[1]);
            else
                arr.push(args[1]);

            gameData = await gameModel.findOneAndUpdate(
                {
                    serverId: message.guild.id
                },
                {
                    $set: {
                        keywords: arr
                    }
                },
                {
                    new: true
                }
            );
        }
        
        /**
         * using $kw d (index || keyword) to del keyword
         */
        const delAliases = ['delete', 'del', 'd'];
        if (delAliases.includes(args[0])) {

            if (!args[1]) return message.reply(lanData.error.syntax.del(server.prefix));
            
            if (isNaN(args[1])) {
                for (let i=0; i<arr.length; i++) {
                    if (args[1] === arr[i]) {
                        arr.splice(arr.indexOf(args[1]), 1);
                        break;
                    }
                }

                gameData = await gameModel.findOneAndUpdate(
                    {
                        serverId: message.guild.id
                    },
                    {
                        $set: {
                            keywords: arr
                        }
                    },
                    {
                        new: true
                    }
                )

            }

            if (!isNaN(args[1])) {
                arr.splice(args[1],1);

                gameData = await gameModel.findOneAndUpdate(
                    {
                        serverId: message.guild.id
                    },
                    {
                        $set: {
                            keywords: arr
                        }
                    },
                    {
                        new: true
                    }
                )                
            }

        }

        /**
         *  update keywords $kw u (index) (keyword)
         */
        const updateAliases = ['update', 'u'];
        if (updateAliases.includes(args[0])) {

            if (isNaN(args[1]) || !args[2]) 
                return message.reply(lanData.error.syntax.update(server.prefix));

            if (args[1] > gameData.keywords.length - 1)
                return message.reply(lanData.error.index);
            
            arr[args[1]-1] = args[2];

            gameData = await gameModel.findOneAndUpdate(
                {
                    serverId: message.guild.id
                },
                {
                    $set: {
                        keywords: arr
                    }
                },
                {
                    new: true
                }
            )
        }
        
        let list = '';
        for (let i=0; i<arr.length; i++) {
            list += `${i+1}.  ${arr[i]}\n` 
        }

        return message.channel.send(`${list}`);
    },
};
