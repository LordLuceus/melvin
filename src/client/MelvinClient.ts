import { DiceRoller } from "@dice-roller/rpg-dice-roller";
import { container, LogLevel, SapphireClient } from "@sapphire/framework";
import { DataSource } from "typeorm";
import { database } from "../config/config.json";
import { Guild } from "../entities/Guild";
import { Roll } from "../entities/Roll";
import { User } from "../entities/User";
import { writeLog } from "../util/log";

export class MelvinClient extends SapphireClient {
  constructor() {
    super({
      intents: ["GUILDS"],
      logger: {
        level:
          process.env.NODE_ENV === "development"
            ? LogLevel.Debug
            : LogLevel.Info,
      },
    });
  }

  public override async login(token: string) {
    const { host, username, password, db, port } = database;
    container.database = new DataSource({
      type: "postgres",
      host,
      port,
      username,
      password,
      database: db,
      entities: [User, Guild, Roll],
      synchronize: process.env.NODE_ENV === "development",
      logging: true,
      maxQueryExecutionTime: 1000,
      logger: "file",
    });

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
