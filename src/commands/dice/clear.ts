import { Command, LogLevel, RegisterBehavior } from "@sapphire/framework";
import { CommandInteraction } from "discord.js";
import { Guild } from "../../entities/Guild";
import { Roll } from "../../entities/Roll";
import { User } from "../../entities/User";
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
        guildIds: ["513474679583801394"],
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      }
    );
  }

  public async chatInputRun(interaction: CommandInteraction) {
    const { manager } = this.container.database;
    const roll = interaction.options.getString("roll")?.toLowerCase().trim();

    try {
      const savedUser = await manager.findOneBy(User, {
        id: interaction.user.id,
      });
      if (!savedUser) {
        return interaction.reply({
          content: "You have not saved any roll shortcuts.",
          ephemeral: true,
        });
      }

      const savedGuild = await manager.findOneBy(Guild, {
        id: interaction.guild?.id,
      });
      if (!savedGuild) {
        return interaction.reply({
          content: "You have not saved any roll shortcuts on this server.",
          ephemeral: true,
        });
      }

      const rolls = await manager.findBy(Roll, {
        user: savedUser,
        guild: savedGuild,
      });
      if (rolls.length === 0) {
        return interaction.reply({
          content: "No roll shortcuts found.",
          ephemeral: true,
        });
      }

      if (!roll) {
        await manager.remove(rolls);
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
      await manager.remove(savedRoll);
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
