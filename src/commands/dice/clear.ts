import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

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

    if (parsedSettings[message.author.id][roll]) {
      delete parsedSettings[message.author.id][roll];
    } else if (roll === "all") {
      delete parsedSettings[message.author.id];
    }
    await this.client.provider.set(
      message.guild,
      "rolls",
      JSON.stringify(parsedSettings)
    );

    return message.reply("Rolls cleared.");
  }
}
