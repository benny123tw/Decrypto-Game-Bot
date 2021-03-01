const chalk = require('chalk');

module.exports = async (bot, Discord, logger, reaction, user) => {
    // If a message gains a reaction and it is uncached, fetch and cache the message
  // You should account for any errors while fetching, it could return API errors if the resource is missing
  if (reaction.message.partial) await reaction.message.fetch();
  // Now the message has been cached and is fully available:
  console.log(`${reaction.message.author}'s message "${reaction.message.content}" gained a reaction!`);
  // Fetches and caches the reaction itself, updating resources that were possibly defunct.
  if (reaction.partial) await reaction.fetch();
  // Now the reaction is fully available and the properties will be reflected accurately:
  console.log(`${reaction.count} user(s) have given the same reaction "${reaction.emoji}" to this message!`);
};
