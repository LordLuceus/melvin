const dotenv = require("dotenv").config();
const Eris = require("eris");

const melvin = new Eris.CommandClient(
  process.env.BOT_TOKEN,
  {},
  {
    description: "A powerful RPG dice bot for Discord",
    owner: "LordLuceus",
    prefix: ["?", "@mention "]
  }
);

module.exports = melvin;
