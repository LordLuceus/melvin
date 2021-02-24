const fs = require("fs");
const dotenv = require("dotenv").config();
const Eris = require("eris");
const { DiceRoll } = require("rpg-dice-roller");

const melvin = new Eris.CommandClient(
  process.env.BOT_TOKEN,
  {},
  {
    description: "A simple but powerful RPG dice bot for Discord",
    owner: "LordLuceus",
    prefix: "?"
  }
);

const setStatus = () => {
  const servers = melvin.guilds.map((guild) => guild.id);
  const statusString =
    servers.length === 1
      ? "dice games in 1 server."
      : `dice games in ${servers.length} servers.`;
  melvin.editStatus(null, { name: statusString });
};

const storePrefixes = (prefixes) => {
  fs.writeFileSync("./log/prefixes.json", JSON.stringify(prefixes));
};

const getPrefixes = () => {
  return JSON.parse(
    fs.readFileSync("./log/prefixes.json", { encoding: "utf8" })
  );
};

const storeGuilds = (guilds) => {
  const guildsArray = guilds.map((guild) => guild);
  fs.writeFileSync("./log/guilds.json", JSON.stringify(guildsArray, null, 2));
};

melvin.on("ready", () => {
  console.log("Ready to roll!");
  setStatus();
  try {
    fs.accessSync("./log/prefixes.json"); // We have some prefixes stored.
    melvin.guildPrefixes = getPrefixes();
  } catch (e) {
    // We don't have prefixes stored.
    storePrefixes(melvin.guildPrefixes);
  }
  try {
    fs.accessSync("./log/guilds.json");
  } catch (e) {
    storeGuilds(melvin.guilds);
  }
});

melvin.on("guildCreate", () => {
  setStatus();
  storeGuilds(melvin.guilds);
});

melvin.on("guildDelete", () => {
  setStatus();
  storeGuilds(melvin.guilds);
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
