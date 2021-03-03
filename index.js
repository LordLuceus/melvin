const fs = require("fs");
const dotenv = require("dotenv").config();
const Eris = require("eris");
const { DiceRoll } = require("rpg-dice-roller");
const utils = require("./utils");

const melvin = new Eris.CommandClient(
  process.env.BOT_TOKEN,
  {},
  {
    description: "A simple but powerful RPG dice bot for Discord",
    owner: "LordLuceus",
    prefix: "?"
  }
);

melvin.on("ready", () => {
  utils.setEngine();
  melvin.editStatus(null, utils.setStatus(melvin.guilds));
  try {
    fs.accessSync("./log/prefixes.json"); // We have some prefixes stored.
    melvin.guildPrefixes = utils.getPrefixes();
  } catch (e) {
    // We don't have prefixes stored.
    utils.storePrefixes(melvin.guildPrefixes);
  }
  try {
    fs.accessSync("./log/guilds.json");
  } catch (e) {
    utils.storeGuilds(melvin.guilds);
  }
  console.log("Ready to roll!");
});

melvin.on("guildCreate", () => {
  melvin.editStatus(null, utils.setStatus(melvin.guilds));
  utils.storeGuilds(melvin.guilds);
});

melvin.on("guildDelete", () => {
  melvin.editStatus(null, setStatus(melvin.guilds));
  utils.storeGuilds(melvin.guilds);
});

melvin.registerCommandAlias("info", "help");
melvin.registerCommandAlias("about", "help");

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
      return "What the frig? You need to provide a prefix.";
    } else if (args.length > 1) {
      return "What the frig? We only need one prefix.";
    }

    melvin.registerGuildPrefix(msg.guildID, args.join(" "));
    storePrefixes(melvin.guildPrefixes);
    return `Prefix changed to ${args.join(" ")}`;
  },
  {
    description: "Change the command prefix",
    fullDescription: "Change the bot's command prefix for this server.",
    usage: "?prefix !",
    cooldown: 1000
  }
);

melvin.connect();
