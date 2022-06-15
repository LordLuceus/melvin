import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { Command } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";

export class PingCommand extends Command {
  constructor(context: Command.Context) {
    super(context, {
      name: "ping",
      description: "Ping Melvin to see if he's alive.",
      cooldownDelay: 5000,
      cooldownLimit: 1,
      chatInputCommand: {
        register: true,
        guildIds: ["513474679583801394"],
      },
    });
  }

  public async chatInputRun(interaction: CommandInteraction) {
    const msg = await interaction.reply({
      content: "Pinging...",
      ephemeral: true,
      fetchReply: true,
    });

    if (isMessageInstance(msg)) {
      const diff = msg.createdTimestamp - interaction.createdTimestamp;
      const ping = Math.round(this.container.client.ws.ping);

      return interaction.editReply(
        `Pong 🏓! (Round trrip took ${diff}ms. Heartbeat: ${ping}ms.)`
      );
    }
    return null;
  }
}
