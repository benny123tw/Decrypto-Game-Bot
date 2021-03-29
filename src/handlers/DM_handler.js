const fs = require('fs');

module.exports = async (bot, Discord) => {
    const command_files = fs.readdirSync('./src/commands/DM/').filter(file => file.endsWith('.js'));

    for (const file of command_files) {
        const command = require(`../commands/DM/${file}`);
        if (command.name) bot.DM_commands.set(command.name, command);
    }
} 