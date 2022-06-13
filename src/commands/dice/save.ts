import { Command, LogLevel, RegisterBehavior } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";
import { Guild } from "../../entities/Guild";
import { Roll } from "../../entities/Roll";
import { User } from "../../entities/User";
import { writeLog } from "../../util/log";

export class SaveCommand extends Command {
  constructor(context: Command.Context) {
    super(context, {
      name: "save",
      description: "Save a dice roll for easy access",
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
            option
              .setName("name")
              .setDescription("The name by which you'll refer to this roll")
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("value")
              .setDescription("The dice roll to save")
              .setRequired(true)
          ),
      {
        guildIds: ["513474679583801394"],
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      }
    );
  }

  public async chatInputRun(interaction: CommandInteraction) {
    const name = interaction.options.getString("name");
    const notation = interaction.options.getString("value");

    if (name && notation && interaction.guild) {
      try {
        const saved = await this.save(
          name,
          notation,
          interaction.user.id,
          interaction.guild.id
        );
        if (!saved) {
          return interaction.reply(
            "You have already saved a roll with this name."
          );
        }
        const savedUser = await this.findUser(interaction.user.id);
        return interaction.reply(this.composeReply(name, notation, !savedUser));
      } catch (err: any) {
        writeLog(LogLevel.Error, this.name, err.message);
        return interaction.reply(`What the frig? ${err.message}`);
      }
    }
  }

  private async findUser(id: string): Promise<User | null> {
    const { manager } = this.container.database;

    const savedUser = await manager.findOne(User, { where: { id } });
    return savedUser;
  }

  private async save(
    name: string,
    notation: string,
    userId: string,
    guildId: string
  ): Promise<boolean> {
    const { manager } = this.container.database;
    const savedGuild = await manager.findOne(Guild, {
      where: { id: guildId },
    });

    const savedUser = await this.findUser(userId);

    const roll = manager.create(Roll, { name, value: notation });

    if (!savedGuild) {
      if (!savedUser) {
        // If there's no user or guild, we make everything from scratch.
        const user = manager.create(User, {
          id: userId,
          rolls: [roll],
        });
        const guild = manager.create(Guild, {
          id: guildId,
          users: [user],
          rolls: [roll],
        });
        await manager.save(guild);
        return true;
      }
      // We have a user, but no guild.
      savedUser.rolls.push(roll);
      const guild = manager.create(Guild, {
        id: guildId,
        users: [savedUser],
        rolls: [roll],
      });
      await manager.save(guild);
      return true;
    }
    // We have a guild.

    if (!savedUser) {
      const user = manager.create(User, {
        id: userId,
        rolls: [roll],
      });
      savedGuild.users.push(user);
      savedGuild.rolls.push(roll);
      await manager.save(savedGuild);
      return true;
    }

    const savedRoll = await manager.findOne(Roll, {
      where: { name, guild: savedGuild, user: savedUser },
    });
    if (savedRoll) {
      return false;
    }

    savedUser.rolls.push(roll);
    savedGuild.users.push(savedUser);
    savedGuild.rolls.push(roll);
    await manager.save(savedGuild);
    return true;
  }

  private composeReply(
    name: string,
    notation: string,
    firstTime?: boolean
  ): string {
    return `Roll \`${notation}\` saved as \`${name}\`. ${
      firstTime
        ? "You can include your saved roll when using the `/roll` command by prefixing it with `$`. If you add anything after the saved roll, please make sure to separate it with a space."
        : ""
    }`;
  }
}
