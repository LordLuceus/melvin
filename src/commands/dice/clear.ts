import { Command, LogLevel, RegisterBehavior } from "@sapphire/framework";
import { CommandInteraction } from "discord.js";
import { writeLog } from "../../util/log";

export class ClearCommand extends Command {
  constructor(context: Command.Context) {
    super(context, {
      name: "clear",
      description: "Remove your roll shortcuts",
      cooldownDelay: 5000,
      cooldownLimit: 1,
      preconditions: ["GuildOnly"],
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addStringOption((option) =>
            option.setName("roll").setDescription("The roll to clear")
          ),
      {
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      }
    );
  }

  public async chatInputRun(interaction: CommandInteraction) {
    const { prisma } = this.container;
    const roll = interaction.options.getString("roll")?.toLowerCase().trim();

    try {
      const savedUser = await prisma.user.findUnique({
        where: { id: interaction.user.id },
      });

      if (!savedUser) {
        return interaction.reply({
          content: "You have not saved any roll shortcuts.",
          ephemeral: true,
        });
      }

      const savedGuild = await prisma.guild.findUnique({
        where: { id: interaction.guild?.id },
      });

      if (!savedGuild) {
        return interaction.reply({
          content: "You have not saved any roll shortcuts on this server.",
          ephemeral: true,
        });
      }

      const rolls = await prisma.roll.findMany({
        where: {
          guild: { id: interaction.guild?.id },
          user: { id: interaction.user.id },
        },
      });

      if (rolls.length === 0) {
        return interaction.reply({
          content: "No roll shortcuts found.",
          ephemeral: true,
        });
      }

      if (!roll) {
        await prisma.roll.deleteMany({
          where: {
            guild: { id: interaction.guild?.id },
            user: { id: interaction.user.id },
          },
        });

        return interaction.reply({
          content: "Your roll shortcuts have been cleared.",
          ephemeral: true,
        });
      }

      const savedRoll = rolls.find((r) => r.name === roll);
      if (!savedRoll) {
        return interaction.reply({
          content: "Roll shortcut not found.",
          ephemeral: true,
        });
      }

      await prisma.roll.delete({
        where: { id: savedRoll.id },
      });

      return interaction.reply({
        content: "Roll shortcut cleared.",
        ephemeral: true,
      });
    } catch (err: any) {
      writeLog(LogLevel.Error, this.name, err.message);
      return interaction.reply(`What the frig? \`${err.message}\``);
    }
  }
}
