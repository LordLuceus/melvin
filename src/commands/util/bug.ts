import {
  Command,
  CommandoMessage,
  CommandoClient,
  ArgumentCollectorResult,
} from "discord.js-commando";
import { Message } from "discord.js";

export default class BugCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "bug",
      description: "Report a bug",
      details: "Use this command to report a bug directly to the developer.",
      group: "util",
      memberName: "bug",
      throttling: {
        usages: 1,
        duration: 5,
      },
      args: [
        {
          key: "report",
          type: "string",
          prompt: "What bug would you like to report?",
        },
      ],
      examples: ["Everything's broken!!!"],
    });
  }

  public async run(
    message: CommandoMessage,
    { report }: { report: string }
  ): Promise<Message | Message[] | null> {
    await this.client.owners[0].send(`${message.author}: ${report}`);
    return message.reply("Report sent.");
  }
}
