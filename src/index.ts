import { LogLevel, SapphireClient } from "@sapphire/framework";
import "@sapphire/plugin-logger/register";
import { token } from "./config/config.json";

const melvin = new SapphireClient({
  intents: ["GUILDS", "GUILD_MESSAGES"],
  logger: {
    level:
      process.env.NODE_ENV === "development" ? LogLevel.Debug : LogLevel.Info,
  },
});

melvin.login(token);
