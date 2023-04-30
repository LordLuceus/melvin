import { DiceRoller } from "@dice-roller/rpg-dice-roller";
import { container, LogLevel, SapphireClient } from "@sapphire/framework";
import { DataSource } from "typeorm";
import { dbConfig } from "../DataSource";
import { writeLog } from "../util/log";

export class MelvinClient extends SapphireClient {
  constructor() {
    super({
      intents: ["GUILDS", "GUILD_MEMBERS"],
      logger: {
        level:
          process.env.NODE_ENV === "development"
            ? LogLevel.Debug
            : LogLevel.Info,
      },
    });
  }

  public override async login(token: string) {
    container.database = dbConfig;

    container.diceRoller = new DiceRoller();

    try {
      container.database = await container.database.initialize();
    } catch (err: any) {
      writeLog(LogLevel.Error, err.name, err.message);
      process.exit(1);
    }
    return super.login(token);
  }

  public override async destroy() {
    await container.database.destroy();
    return super.destroy();
  }
}

declare module "@sapphire/pieces" {
  /* eslint no-unused-vars: "off" */
  interface Container {
    database: DataSource;
    diceRoller: DiceRoller;
  }
}
