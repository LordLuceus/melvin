import { Message } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Tracker } from "../../util/types";

export default class InitlistCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "initlist",
      description: "List the rolls recorded in the initiative tracker",
      group: "initiative",
      memberName: "initlist",
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
      userPermissions: ["MANAGE_GUILD"],
    });
  }

  public run(message: CommandoMessage) {
    const savedTracker = this.client.provider.get(message.guild, "tracker");

    if (!savedTracker) {
      return message.reply(
        `There is no running tracker. Type ${message.anyUsage(
          "start"
        )} to initialize a new tracker.`
      );
    }

    const tracker: Tracker = JSON.parse(savedTracker);

    const initList = tracker.entries.map((i) => {
      if (i.current) {
        return `[✔] ${i.name}: ${i.value}`;
      }
      return `${i.name}: ${i.value}`;
    });

    return message.reply(initList.join("\n"), { split: { char: "\n" } });
  }
}
