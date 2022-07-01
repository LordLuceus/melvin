import { Command } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";
import ms from "ms";

export class StatusCommand extends Command {
  constructor(context: Command.Context) {
    super(context, {
      name: "status",
      description: "Check Melvin's status",
      preconditions: ["OwnerOnly"],
      chatInputCommand: {
        register: true,
      },
    });
  }

  public chatInputRun(interaction: CommandInteraction) {
    return interaction.reply({
      content: `Serving ${
        this.container.client.guilds.cache.size
      } guilds for ${ms(this.container.client.uptime as number, {
        long: true,
      })}. Using ${process.memoryUsage().rss / 1024 / 1024} MB of memory.`,
      ephemeral: true,
    });
  }
}
