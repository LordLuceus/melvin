import { DiceRoller } from "@dice-roller/rpg-dice-roller";
import type { PrismaClient } from "@prisma/client";
import { container, LogLevel, SapphireClient } from "@sapphire/framework";
import { DataSource } from "typeorm";
import { dbConfig } from "../DataSource";
import { prisma } from "../prisma";
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
    container.database = dbConfig;
    container.prisma = prisma;

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
    await container.prisma.$disconnect();
    return super.destroy();
  }
}

declare module "@sapphire/pieces" {
  /* eslint no-unused-vars: "off" */
  interface Container {
    database: DataSource;
    diceRoller: DiceRoller;
    prisma: PrismaClient;
  }
}
