const { Command } = require("discord.js-commando");
const { DiceRoll } = require("rpg-dice-roller");

module.exports = class MinCommand extends Command {
  constructor(client) {
    super(client, {
      name: "minimum",
      aliases: ["min"],
      group: "dice",
      memberName: "min",
      description: "Get the minimum total for a dice roll",
      examples: ["?min 16d6"],
      throttling: {
        usages: 1,
        duration: 3
      },
      args: [
        {
          key: "notation",
          prompt: "What the frig? I require dice, you fool!",
          type: "string"
        }
      ]
    });
  }

  run(message, { notation }) {
    const roll = new DiceRoll(notation);
    return message.reply(roll.minTotal);
  }

  onError(err, message) {
    return message.reply(
      "What the frig? Foolish Steve! That is not a dice roll."
    );
  }
};
