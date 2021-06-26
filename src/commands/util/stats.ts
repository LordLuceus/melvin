import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import ms from "ms";

export class StatsCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "stats",
      description: "Check the bot's basic stats",
      group: "util",
      memberName: "stats",
      ownerOnly: true,
    });
  }

  run(message: CommandoMessage) {
    return message.reply(
      `I've been rolling dice in ${
        this.client.guilds.cache.size
      } servers for ${ms(this.client.uptime as number, { long: true })}.`
    );
  }
}
