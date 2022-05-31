import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

export default class EndCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "end",
      description: "End combat and clear the initiative tracker",
      group: "initiative",
      memberName: "end",
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
      return message.reply("There is no running tracker.");
    }
    this.client.provider.remove(message.guild, "tracker");
    return message.reply("Tracker cleared.");
  }
}
