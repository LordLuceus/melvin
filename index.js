const path = require("path");
const { CommandoClient, SQLiteProvider } = require("discord.js-commando");
const { token, owner, prefix } = require("./config/config.json");
const { NumberGenerator } = require("rpg-dice-roller");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

const setEngine = () => {
  const { engines, generator } = NumberGenerator;
  generator.engine = engines.nodeCrypto;
};

const melvin = new CommandoClient({
  commandPrefix: prefix,
  owner
});

melvin
  .setProvider(
    sqlite
      .open({
        filename: path.join(__dirname, "db/melvin.db"),
        driver: sqlite3.Database
      })
      .then((db) => new SQLiteProvider(db))
  )
  .catch(console.error);

melvin.registry
  .registerGroups([["dice", "Dice Commands"]])
  .registerDefaultTypes()
  .registerDefaultGroups()
  .registerDefaultCommands({ unknownCommand: false })
  .registerCommandsIn(path.join(__dirname, "commands"));

melvin.once("ready", () => {
  setEngine();
  melvin.user.setActivity(`dice in ${melvin.guilds.cache.size} servers.`);
  console.log("Ready to roll!");
});

melvin.on("error", console.error);

melvin.login(token);
