const dotenv = require("dotenv").config();
const Eris = require("eris");
const { DiceRoll } = require("rpg-dice-roller");

const melvin = new Eris.CommandClient(
  process.env.BOT_TOKEN,
  {},
  {
    description: "A simple but powerful RPG dice bot for Discord",
    owner: "LordLuceus",
    prefix: "#"
  }
);

melvin.on("ready", () => {
  console.log("Ready to roll!");
});

const rollCommand = melvin.registerCommand(
  "roll",
  (msg, args) => {
    if (args.length === 0) {
      return "What the frig? Roll something, you fool.";
    }

    const rollString = args.join(" ");

    try {
      const roll = new DiceRoll(rollString);
      return roll.output;
    } catch (e) {
      return "What the frig? Foolish Steve! That is not a dice roll.";
    }
  },
  {
    description: "Roll dice",
    fullDescription: "Roll dice using standard RPG dice notation.",
    usage: "2d6+5"
  }
);

melvin.connect();
