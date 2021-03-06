import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { rollDice } from "../../util/roll-dice";

export default class AverageCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "average",
      aliases: ["avg"],
      group: "dice",
      memberName: "average",
      description: "Get the average total for a dice roll",
      examples: ["?avg 16d6"],
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
    return message.reply(roll.averageTotal);
  }

  onError(err: Error, message: CommandoMessage) {
    return message.reply(`What the frig? Foolish Steve! ${err.message}`);
  }
}
