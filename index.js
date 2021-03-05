const fs = require("fs");
const melvin = require("./client");
const { rollCommand, prefixCommand } = require("./commands");
const utils = require("./utils");

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

melvin.connect();
