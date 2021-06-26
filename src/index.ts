import { CommandoClient, SQLiteProvider } from "discord.js-commando";
import path from "path";
import { NumberGenerator } from "rpg-dice-roller";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { owner, prefix, token } from "./config/config.json";

const setEngine = () => {
  const { engines, generator } = NumberGenerator;
  generator.engine = engines.nodeCrypto;
};

const melvin = new CommandoClient({
  commandPrefix: prefix,
  owner,
});

melvin
  .setProvider(
    open({
      filename: path.join(process.cwd(), "src/db/melvin.db"),
      driver: sqlite3.Database,
    }).then((db) => new SQLiteProvider(db))
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
  melvin.user?.setActivity(`dice in ${melvin.guilds.cache.size} servers.`);
  console.log("Ready to roll!");
});

melvin.on("error", console.error);

melvin.on("guildCreate", () => {
  melvin.user?.setActivity(`dice in ${melvin.guilds.cache.size} servers.`);
});

melvin.on("guildDelete", () => {
  melvin.user?.setActivity(`dice in ${melvin.guilds.cache.size} servers.`);
});

melvin.login(token);
