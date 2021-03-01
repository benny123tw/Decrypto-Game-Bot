require('dotenv').config();
const config = require('./config.json');
const BotFactory = require('./src/bot');

const { bots } = config;

bots.forEach((botConfig, index) => {
    if (botConfig.name === 'TestBot') return;
    const { token } = botConfig;
    const bot = BotFactory.createBot({
        ...botConfig,
        token: process.env[token],
        index,
    });

    bot.start();
});
