import {
  ChatInputCommand,
  Command,
  CommandOptionsRunTypeEnum,
  LogLevel,
  RegisterBehavior,
} from "@sapphire/framework";
import { PermissionFlagsBits } from "discord.js";
import { writeLog } from "../../util";

export class LaughCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: "laugh",
      description: "Enable or disable Melvin's evil laugh when rolling a 1",
      cooldownDelay: 5000,
      cooldownLimit: 1,
      requiredUserPermissions: [PermissionFlagsBits.ManageGuild],
      runIn: CommandOptionsRunTypeEnum.GuildText,
    });
  }

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry
  ) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addBooleanOption((option) =>
            option
              .setName("enabled")
              .setDescription("Enable or disable Melvin's evil laugh")
              .setRequired(true)
          ),
      {
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      }
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const { guild } = interaction;
    if (!guild) return null;

    const { prisma } = this.container;

    const enabled = interaction.options.getBoolean("enabled", true);

    const savedGuild = await prisma.guild.findUnique({
      where: { id: guild.id },
    });

    try {
      if (!savedGuild) {
        await prisma.guild.create({
          data: {
            id: guild.id,
            laugh: enabled,
          },
        });

        return interaction.reply({
          content: `${
            enabled
              ? "Foolish Steve! You shall regret this. Buahahahaha!"
              : "Foolish Steve! I knew you could not handle it. Buahahahaha!"
          }`,
          ephemeral: true,
        });
      }

      await prisma.guild.update({
        where: { id: guild.id },
        data: {
          laugh: enabled,
        },
      });

      return interaction.reply({
        content: `${
          enabled
            ? "Foolish Steve! You shall regret this. Buahahahaha!"
            : "Foolish Steve! I knew you could not handle it. Buahahahaha!"
        }`,
        ephemeral: true,
      });
    } catch (err: any) {
      writeLog(LogLevel.Error, this.name, err.message);
      return interaction.reply({
        content: `What the frig? There was an error setting the laugh option: ${err.message}`,
        ephemeral: true,
      });
    }
  }
}
