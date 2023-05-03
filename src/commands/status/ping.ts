import { isMessageInstance } from "@sapphire/discord.js-utilities";
import {
  ChatInputCommand,
  Command,
  RegisterBehavior,
} from "@sapphire/framework";

export class PingCommand extends Command {
  constructor(context: Command.Context) {
    super(context, {
      name: "ping",
      description: "Ping Melvin to see if he's alive.",
      cooldownDelay: 5000,
      cooldownLimit: 1,
      preconditions: ["OwnerOnly"],
    });
  }

  public override async registerApplicationCommands(
    registry: ChatInputCommand.Registry
  ) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      {
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      }
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
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
