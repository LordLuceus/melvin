import { Message } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { rollDice } from "../../util/roll-dice";
import { Tracker } from "../../util/types";

export default class InitCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "init",
      description: "Roll initiative and add it to the tracker",
      group: "initiative",
      memberName: "init",
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5,
      },
      args: [
        {
          key: "notation",
          type: "string",
          prompt: "Roll initiative",
        },
      ],
    });
  }

  public run(message: CommandoMessage, { notation }: { notation: string }) {
    const savedTracker = this.client.provider.get(message.guild, "tracker");

    if (!savedTracker) {
      return message.reply(
        `There is no running tracker. Type ${message.anyUsage(
          "start"
        )} to initialize a new tracker.`
      );
    }

    const tracker: Tracker = JSON.parse(savedTracker);

    if (tracker.sorted) {
      return message.reply("Combat has already begun.");
    }

    const roll = rollDice(notation, this.client, message);
    tracker.entries.push({
      name: message.author.toString(),
      value: roll.total,
    });
    this.client.provider.set(message.guild, "tracker", JSON.stringify(tracker));
    return message.reply(roll.output, { split: { char: " " } });
  }
}
