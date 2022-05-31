import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message } from "discord.js";
import { RollSettings } from "../../util/types";

export default class ClearCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "clear",
      description: "Delete specific rolls or wipe all your saved rolls",
      details:
        "You can use this command with no arguments to clear all your saved rolls, or you can specify a roll name to clear. You can also clear multiple rolls at once by specifying multiple names separated by spaces.",
      group: "dice",
      memberName: "clear",
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5,
      },
      args: [
        {
          type: "string",
          key: "rolls",
          prompt: "Which roll(s) to clear?",
          default: ["all"],
          infinite: true,
        },
      ],
      examples: ["?clear", "?clear fireball", "?clear fireball dexSave"],
    });
  }

  async run(message: CommandoMessage, { rolls: rolls }: { rolls: string[] }) {
    const savedSettings = this.client.provider.get(message.guild, "rolls");
    if (!savedSettings) {
      return message.reply("There are no saved rolls to clear.");
    }

    const parsedSettings: RollSettings = JSON.parse(savedSettings);
    if (!parsedSettings[message.author.id]) {
      return message.reply("You have no saved rolls.");
    }

    let reply: Message | null = null;
    for (const roll of rolls) {
      if (parsedSettings[message.author.id][roll]) {
        delete parsedSettings[message.author.id][roll];
        if (Object.keys(parsedSettings[message.author.id]).length === 0) {
          delete parsedSettings[message.author.id];
        }
        reply = await message.reply(`Roll \`${roll}\` was cleared.`);
      } else if (!parsedSettings[message.author.id][roll] && roll !== "all") {
        reply = await message.reply(`The roll \`${roll}\` does not exist.`);
      } else {
        delete parsedSettings[message.author.id];
        reply = await message.reply("Rolls cleared.");
      }
    }
    await this.client.provider.set(
      message.guild,
      "rolls",
      JSON.stringify(parsedSettings)
    );

    return reply;
  }
}
