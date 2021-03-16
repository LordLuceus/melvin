const { Command } = require("discord.js-commando");
const ms = require("ms");

module.exports = class StatsCommand extends Command {
  constructor(client) {
    super(client, {
      name: "stats",
      description: "Check the bot's basic stats",
      group: "util",
      memberName: "stats",
      ownerOnly: true
    });
  }

  run(message) {
    return message.reply(
      `I've been rolling dice in ${
        this.client.guilds.cache.size
      } servers for ${ms(this.client.uptime, { long: true })}.`
    );
  }
};
