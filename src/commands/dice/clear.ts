import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

export default class ClearCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "clear",
      description: "Wipe your saved rolls",
      group: "dice",
      memberName: "clear",
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  async run(message: CommandoMessage) {
    const savedSettings = this.client.provider.get(message.guild, "rolls");
    if (!savedSettings) {
      return message.reply("There are no saved rolls to clear.");
    }

    const parsedSettings = JSON.parse(savedSettings);
    if (!parsedSettings[message.author.id]) {
      return message.reply("You have no saved rolls.");
    }

    delete parsedSettings[message.author.id];
    await this.client.provider.set(
      message.guild,
      "rolls",
      JSON.stringify(parsedSettings)
    );

    return message.reply("Rolls cleared.");
  }
}
