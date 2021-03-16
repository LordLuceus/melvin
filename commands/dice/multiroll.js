const { Command } = require("discord.js-commando");
const { DiceRoll } = require("rpg-dice-roller");

module.exports = class MultirollCommand extends Command {
  constructor(client) {
    super(client, {
      name: "multiroll",
      description: "Roll dice a given number of times",
      aliases: ["rr", "repeat"],
      group: "dice",
      memberName: "multiroll",
      throttling: {
        usages: 1,
        duration: 5
      },
      examples: ["?rr 6 4d6kh3"],
      args: [
        {
          key: "repetitions",
          prompt: "How many frigging times shall I roll these dice?",
          type: "integer"
        },
        {
          key: "notation",
          prompt: "What the frig? I require dice, you fool!",
          type: "string"
        }
      ]
    });
  }

  run(message, { repetitions, notation }) {
    const rolls = [];
    for (let i = 0; i < repetitions; i++) {
      const roll = new DiceRoll(notation);
      rolls.push(roll.output);
    }

    return message.reply(rolls.join("\n"), {
      split: { char: "\n" }
    });
  }

  onError(err, message) {
    return message.reply(
      "What the frig? Foolish Steve! That is not a dice roll."
    );
  }
};
