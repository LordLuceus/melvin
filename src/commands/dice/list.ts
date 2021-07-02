import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

export default class ListCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "list",
      group: "dice",
      memberName: "list",
      description: "List your saved rolls",
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  run(message: CommandoMessage) {
    const savedSettings = this.client.provider.get(message.guild, "rolls");
    if (!savedSettings) {
      return message.reply("You haven't saved any rolls.");
    }

    const parsedSettings = JSON.parse(savedSettings);
    if (!parsedSettings[message.author.id]) {
      return message.reply("You haven't saved any rolls.");
    }

    const listString = JSON.stringify(
      parsedSettings[message.author.id],
      null,
      2
    )
      .replace(/["\{\}]|^ +/gm, "")
      .trim();

    return message.reply(listString, { split: { char: "\n" } });
  }
}
