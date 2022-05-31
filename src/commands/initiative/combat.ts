import { CollectorFilter, Message, MessageReaction, User } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import type { Tracker } from "../../util/types";

export default class CombatCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "combat",
      aliases: ["startcombat", "sc", "fight"],
      description: "End initiative rolling stage and begin combat",
      details:
        "This disables further initiative rolling and sorts the list by roll in descending order. This can also be used to re-enable initiative rolling mid-combat, for instance if a player was late.",
      group: "initiative",
      memberName: "combat",
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
      userPermissions: ["MANAGE_GUILD"],
    });
  }

  public async run(message: CommandoMessage) {
    const savedTracker = this.client.provider.get(message.guild, "tracker");

    if (!savedTracker) {
      return message.reply(
        `There is no running tracker. Type ${message.anyUsage(
          "start"
        )} to initialize a new tracker.`
      );
    }

    const tracker: Tracker = JSON.parse(savedTracker);
    if (tracker.entries.length === 0) {
      return message.reply(
        `No initiative rolls in tracker. Use the \`init\` or \`monster\` command to roll initiative.`
      );
    }
    if (tracker.sorted) {
      const filter: CollectorFilter = (
        reaction: MessageReaction,
        user: User
      ) => {
        return (
          ["👍", "👎"].includes(reaction.emoji.name) &&
          user.id === message.author.id
        );
      };
      const reply = await message.reply(
        "Combat has already begun. Would you like to add more rolls?"
      );
      await reply.react("👍");
      await reply.react("👎");

      try {
        const collected = await reply.awaitReactions(filter, {
          max: 1,
          time: 30000,
          errors: ["time"],
        });
        const reaction = collected.first();

        if (reaction?.emoji.name === "👍") {
          tracker.sorted = false;
          await this.client.provider.set(
            message.guild,
            "tracker",
            JSON.stringify(tracker)
          );
          return message.reply(
            "You may now add more rolls to the tracker. Remember to use this command again when done."
          );
        }

        return null;
      } catch {
        return null;
      }
    }

    tracker.entries = tracker.entries.sort((a, b) => b.value - a.value);
    tracker.sorted = true;
    const continueCombat = tracker.entries.some((i) => i.current);
    if (!continueCombat) {
      tracker.entries[0].current = true;
    }

    this.client.provider.set(message.guild, "tracker", JSON.stringify(tracker));
    const reply = continueCombat
      ? "Continuing combat."
      : `Combat started. First up is ${tracker.entries[0].name} at ${tracker.entries[0].value}.`;
    return message.reply(reply);
  }
}
