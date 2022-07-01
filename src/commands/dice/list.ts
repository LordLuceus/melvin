import { Command, LogLevel, RegisterBehavior } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";
import { Guild } from "../../entities/Guild";
import { Roll } from "../../entities/Roll";
import { User } from "../../entities/User";
import { chunkString } from "../../util/chunkString";
import { writeLog } from "../../util/log";

export class ListCommand extends Command {
  constructor(context: Command.Context) {
    super(context, {
      name: "list",
      description: "List your saved rolls",
      chatInputCommand: {
        register: true,
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
        guildIds: ["513474679583801394"],
      },
      preconditions: ["GuildOnly"],
      cooldownDelay: 5000,
      cooldownLimit: 1,
    });
  }

  public async chatInputRun(interaction: CommandInteraction) {
    const { manager } = this.container.database;
    try {
      const savedUser = await manager.findOneBy(User, {
        id: interaction.user.id,
      });

      if (!savedUser) {
        return interaction.reply({
          content: "You have no saved rolls. Try using the `/save` command.",
          ephemeral: true,
        });
      }
      const savedGuild = await manager.findOneBy(Guild, {
        id: interaction.guild?.id,
      });

      if (savedGuild && savedUser) {
        const rolls = await manager.findBy(Roll, {
          guild: savedGuild,
          user: savedUser,
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
          const messages = chunkString(reply, "\n");
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
