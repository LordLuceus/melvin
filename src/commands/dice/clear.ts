import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message } from "discord.js";

export default class ClearCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "clear",
      description: "Delete a roll or wipe all your saved rolls",
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
          key: "roll",
          prompt: "Which roll to clear?",
          default: "all",
        },
      ],
      examples: ["?clear", "?clear fireball"],
    });
  }

  async run(message: CommandoMessage, { roll }: { roll: string }) {
    const savedSettings = this.client.provider.get(message.guild, "rolls");
    if (!savedSettings) {
      return message.reply("There are no saved rolls to clear.");
    }

    const parsedSettings = JSON.parse(savedSettings);
    if (!parsedSettings[message.author.id]) {
      return message.reply("You have no saved rolls.");
    }

    let reply: Message;
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
    await this.client.provider.set(
      message.guild,
      "rolls",
      JSON.stringify(parsedSettings)
    );

    return reply;
  }
}
