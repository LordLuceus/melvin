const { Command } = require("discord.js-commando");
const { DiceRoll } = require("rpg-dice-roller");

module.exports = class RollCommand extends Command {
  constructor(client) {
    super(client, {
      name: "roll",
      aliases: ["r"],
      group: "dice",
      memberName: "roll",
      description: "Roll dice",
      details: "Roll dice using standard RPG dice notation (xdy)",
      examples: [
        "?roll 2d8+5",
        "?roll 4d6kh3",
        "?roll 2d20kl1+11",
        "?roll d20ro+12"
      ],
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
    return message.reply(roll.output, {
      split: {
        char: " "
      }
    });
  }

  onError(err, message) {
    return message.reply(
      "What the frig? Foolish Steve! That is not a dice roll."
    );
  }
};
