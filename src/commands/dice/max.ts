import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { rollDice } from "../../util/roll-dice";

export default class MaxCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "maximum",
      aliases: ["max"],
      group: "dice",
      memberName: "max",
      description: "Get the maximum total for a dice roll",
      examples: ["?max 16d6"],
      throttling: {
        usages: 1,
        duration: 3,
      },
      args: [
        {
          key: "notation",
          prompt: "What the frig? I require dice, you fool!",
          type: "string",
        },
      ],
    });
  }

  run(message: CommandoMessage, { notation }: { notation: string }) {
    const roll = rollDice(notation, this.client, message);
    return message.reply(roll.maxTotal);
  }

  onError(err: Error, message: CommandoMessage) {
    return message.reply(`What the frig? Foolish Steve! ${err.message}`);
  }
}
