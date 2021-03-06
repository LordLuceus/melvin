import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { rollDice } from "../../util/roll-dice";

export default class MinCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "minimum",
      aliases: ["min"],
      group: "dice",
      memberName: "min",
      description: "Get the minimum total for a dice roll",
      examples: ["?min 16d6"],
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
    return message.reply(roll.minTotal);
  }

  onError(err: Error, message: CommandoMessage) {
    return message.reply(`What the frig? Foolish Steve! ${err.message}`);
  }
}
