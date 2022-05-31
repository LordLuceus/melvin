import { Message } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { rollDice } from "../../util/roll-dice";
import type { Tracker } from "../../util/types";

export default class MonsterCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "monster",
      aliases: ["npc"],
      description: "Roll initiative for a monster or NPC",
      details:
        "This is similar to the `init` command, with the addition of the ability to add a name to the roll. Useful for rolling for monsters or NPCs. Keep in mind that the name cannot include spaces unless you surround it with double quotes.",
      group: "initiative",
      memberName: "monster",
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5,
      },
      args: [
        {
          key: "name",
          type: "string",
          prompt: "Who are you rolling initiative for?",
        },
        {
          key: "notation",
          type: "string",
          prompt: "Roll the dice.",
        },
      ],
    });
  }

  public run(
    message: CommandoMessage,
    { name, notation }: { name: string; notation: string }
  ) {
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

    tracker.entries.push({ name, value: roll.total });
    this.client.provider.set(message.guild, "tracker", JSON.stringify(tracker));
    return message.reply(roll.output, { split: { char: " " } });
  }
}
