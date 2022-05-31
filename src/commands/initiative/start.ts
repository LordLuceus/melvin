import { Message } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Tracker } from "../../util/types";

export default class StartCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "start",
      description: "Start a new initiative tracker",
      group: "initiative",
      memberName: "start",
      guildOnly: true,
      userPermissions: ["MANAGE_GUILD"],
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  public run(message: CommandoMessage) {
    const savedTracker = this.client.provider.get(message.guild, "tracker");
    if (savedTracker) {
      return message.reply(
        `A tracker is already running. Type ${message.anyUsage(
          "end"
        )} to stop it.`
      );
    }

    const tracker: Tracker = { entries: [], sorted: false };
    this.client.provider.set(message.guild, "tracker", JSON.stringify(tracker));
    return message.reply(
      `Tracker started. Players may now use the \`init\` command to roll initiative. GMs can roll initiative for monsters with the \`monster\` command.`
    );
  }
}
