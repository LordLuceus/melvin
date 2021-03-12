const { DiceRoll } = require("rpg-dice-roller");
const melvin = require("./client");
const utils = require("./utils");

const rollCommand = melvin.registerCommand(
  "roll",
  (msg, args) => {
    if (args.length === 0) {
      return "What the frig? Roll something, you fool.";
    }

    const rollString = args.join(" ");

    try {
      const roll = new DiceRoll(rollString);
      return `${msg.author.mention}: ${roll.output}`;
    } catch (e) {
      return "What the frig? Foolish Steve! That is not a dice roll.";
    }
  },
  {
    description: "Roll dice",
    fullDescription: "Roll dice using standard RPG dice notation.",
    usage: "?roll 2d6+5",
    aliases: ["r"],
    caseInsensitive: true,
    cooldown: 1000
  }
);

const prefixCommand = melvin.registerCommand(
  "prefix",
  (msg, args) => {
    if (args.length === 0) {
      return `Your prefix is ${melvin.guildPrefixes[msg.guildID] || "?"}`;
    } else if (args.length > 1) {
      return "What the frig? We only need one prefix.";
    }

    melvin.registerGuildPrefix(msg.guildID, args.join(" "));
    utils.storePrefixes(melvin.guildPrefixes);
    return `Prefix changed to ${args.join(" ")}`;
  },
  {
    description: "Change the command prefix",
    fullDescription: "Change the bot's command prefix for this server.",
    usage: "?prefix !",
    cooldown: 1000
  }
);

module.exports = {
  rollCommand,
  prefixCommand
};
