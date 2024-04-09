import {
  ChatInputCommand,
  Command,
  RegisterBehavior,
} from "@sapphire/framework";
import ms from "ms";

export class StatusCommand extends Command {
  constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: "status",
      description: "Check Melvin's status",
      preconditions: ["OwnerOnly"],
    });
  }

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry
  ) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      { behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
    );
  }

  public chatInputRun(interaction: Command.ChatInputCommandInteraction) {
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
