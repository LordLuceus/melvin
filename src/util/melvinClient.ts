import { SapphireClient, LogLevel, container } from "@sapphire/framework";
import { DataSource } from "typeorm";
import { database } from "../config/config.json";

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
      synchronize: true,
      logging: true,
      logger: "file",
    });

    container.database = await container.database.initialize();
    return super.login(token);
  }

  public override async destroy() {
    await container.database.destroy();
    return super.destroy();
  }
}

declare module "@sapphire/pieces" {
  interface Container {
    database: DataSource;
  }
}
