import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import ms from "ms";

export default class StatsCommand extends Command {
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
      `Uptime: ${ms(this.client.uptime as number, { long: true })}
      Guilds: ${this.client.guilds.cache.size}
      Memory usage: ${process.memoryUsage().rss}`
    );
  }
}
