import { SapphireClient } from "@sapphire/framework";
import "@sapphire/plugin-logger/register";
import { token } from "./config/config.json";

const melvin = new SapphireClient({
  intents: ["GUILDS", "GUILD_MESSAGES"],
});

melvin.login(token);
