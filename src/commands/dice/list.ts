import { Command, LogLevel, RegisterBehavior } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";
import { chunkString } from "../../util/chunkString";
import { writeLog } from "../../util/log";

export class ListCommand extends Command {
  constructor(context: Command.Context) {
    super(context, {
      name: "list",
      description: "List your saved rolls",
      preconditions: ["GuildOnly"],
      cooldownDelay: 5000,
      cooldownLimit: 1,
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      {
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      }
    );
  }

  public async chatInputRun(interaction: CommandInteraction) {
    const { prisma } = this.container;

    try {
      const savedUser = await prisma.user.findUnique({
        where: { id: interaction.user.id },
      });

      if (!savedUser) {
        return interaction.reply({
          content: "You have no saved rolls. Try using the `/save` command.",
          ephemeral: true,
        });
      }

      const savedGuild = await prisma.guild.findUnique({
        where: { id: interaction.guild?.id },
      });

      if (!savedGuild) {
        return interaction.reply({
          content: "You haven't saved any roll shortcuts in this server.",
          ephemeral: true,
        });
      }

      if (savedGuild && savedUser) {
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

        const rollList = rolls.map((r) => `${r.name}: ${r.value}`);
        const reply = rollList.join("\n");
        if (reply.length > 2000) {
          const messages = chunkString(reply, ["\n"]);
          const followups = messages.slice(1);
          await interaction.reply({ content: messages[0], ephemeral: true });
          return followups.forEach((r) =>
            interaction.followUp({ content: r, ephemeral: true })
          );
        }

        return interaction.reply({
          content: reply,
          ephemeral: true,
        });
      }
    } catch (err: any) {
      writeLog(LogLevel.Error, this.name, err.message);
      return interaction.reply(`What the frig? \`${err.message}\``);
    }

    return null;
  }
}
