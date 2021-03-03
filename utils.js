const fs = require("fs");
const { NumberGenerator } = require("rpg-dice-roller");

const setEngine = () => {
  const { engines, generator } = NumberGenerator;
  generator.engine = engines.nodeCrypto;
};

const setStatus = (guilds) => {
  const servers = guilds.map((guild) => guild.id);
  const statusString =
    servers.length === 1
      ? "dice games in 1 server."
      : `dice games in ${servers.length} servers.`;
  return { name: statusString };
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

module.exports = {
  setEngine,
  setStatus,
  getPrefixes,
  storePrefixes,
  storeGuilds
};
