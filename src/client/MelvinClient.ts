import { DiceRoller } from "@dice-roller/rpg-dice-roller";
import { PrismaClient } from "@prisma/client";
import { container, LogLevel, SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";

export class MelvinClient extends SapphireClient {
  constructor() {
    super({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
      logger: {
        level:
          process.env.NODE_ENV === "development"
            ? LogLevel.Debug
            : LogLevel.Info,
      },
    });
  }

  public override async login(token: string) {
    container.prisma = new PrismaClient();

    container.diceRoller = new DiceRoller();

    try {
      await container.prisma.$connect();
    } catch (err: any) {
      this.logger.fatal(err);
      process.exit(1);
    }

    return super.login(token);
  }

  public override async destroy() {
    await container.prisma.$disconnect();
    return super.destroy();
  }
}

declare module "@sapphire/pieces" {
  /* eslint no-unused-vars: "off" */
  interface Container {
    diceRoller: DiceRoller;
    prisma: PrismaClient;
  }
}
