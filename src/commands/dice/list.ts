import { Command, RegisterBehavior } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";
import { Guild } from "../../entities/Guild";
import { Roll } from "../../entities/Roll";
import { User } from "../../entities/User";

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
          content: "No rolls found.",
          ephemeral: true,
        });
      }
      const rollList = rolls.map((r) => `${r.name}: ${r.value}`);
      return interaction.reply({
        content: rollList.join("\n"),
        ephemeral: true,
      });
    }
    return null;
  }
}
