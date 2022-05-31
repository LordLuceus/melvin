import { Message } from "discord.js";
import {
  ArgumentCollectorResult,
  Command,
  CommandoClient,
  CommandoMessage,
} from "discord.js-commando";
import { Tracker, TrackerItem } from "../../util/types";

export default class NextCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "next",
      description: "Go to the next turn in initiative order",
      group: "initiative",
      memberName: "next",
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
    if (!savedTracker) {
      return message.reply(
        `There is no running tracker. Type ${message.anyUsage(
          "start"
        )} to initialize a new tracker.`
      );
    }

    const tracker: Tracker = JSON.parse(savedTracker);
    if (!tracker.sorted) {
      return message.reply(
        `Combat has not started. Use the \`combat\` command.`
      );
    }

    const idx = tracker.entries.findIndex((i) => i.current);
    let turnPlayer: TrackerItem;
    if (idx >= tracker.entries.length - 1) {
      // Go back to the top of the round.
      turnPlayer = tracker.entries[0];
      tracker.entries[0].current = true;
    } else {
      turnPlayer = tracker.entries[idx + 1];
      tracker.entries[idx + 1].current = true;
    }
    tracker.entries[idx].current = false;
    this.client.provider.set(message.guild, "tracker", JSON.stringify(tracker));

    return message.reply(
      `Next up is ${turnPlayer.name} at ${turnPlayer.value}`
    );
  }
}
