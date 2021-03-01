const chalk = require('chalk');
const playerSchema = require('../../models/playerSchema');

module.exports = async (bot, Discord, logger, member) => {
    console.log(`welcome ${member}`);
    const profile = await playerSchema.create({
        playerId: message.member.id,
        coins: 100,
        total_Games: 0,
        wins: 0,
        loses: 0,
    });
    profile.save();
};
