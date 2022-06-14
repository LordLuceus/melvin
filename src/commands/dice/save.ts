import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { Command, LogLevel, RegisterBehavior } from "@sapphire/framework";
import type {
  CommandInteraction,
  MessageComponentInteraction,
} from "discord.js";
import { AddComponents } from "discord.js-components";
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
        const savedUser = await this.findUser(interaction.user.id);

        const saved = await this.save(
          name,
          notation,
          interaction.user.id,
          interaction.guild.id
        );
        if (!saved) {
          const reply = await this.composeReply(interaction, name, notation, {
            confirm: true,
          });

          const filter = (i: MessageComponentInteraction) => {
            i.deferUpdate();
            return i.user.id === interaction.user.id;
          };

          if (isMessageInstance(reply)) {
            const response = await reply.awaitMessageComponent({
              filter,
              componentType: "BUTTON",
              time: 30000,
            });
            if (response.customId === "1") {
              await this.save(
                name,
                notation,
                interaction.user.id,
                interaction.guild?.id,
                true
              );
              return this.composeReply(interaction, name, notation, {
                edit: true,
              });
            }
            return interaction.editReply({
              content: "Okay. The roll will not be overwritten.",
              components: [],
            });
          }
        }
        return this.composeReply(interaction, name, notation, {
          firstTime: !savedUser,
        });
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
    guildId: string,
    overwrite?: boolean
  ): Promise<boolean> {
    const { manager } = this.container.database;

    const savedGuild = await manager.findOne(Guild, {
      where: { id: guildId },
    });

    const savedUser = await this.findUser(userId);

    const roll = manager.create(Roll, { name, value: notation });

    if (overwrite) {
      if (savedGuild && savedUser) {
        const savedRoll = await manager.findOne(Roll, {
          where: { name, user: savedUser, guild: savedGuild },
        });
        if (savedRoll) {
          await manager.remove(savedRoll);
          roll.guild = savedGuild;
          roll.user = savedUser;
          await manager.save(roll);
          return true;
        }
      }
    }

    if (!savedGuild) {
      if (!savedUser) {
        // If there's no user or guild, we make everything from scratch.
        const user = manager.create(User, {
          id: userId,
        });
        const guild = manager.create(Guild, {
          id: guildId,
        });
        roll.user = user;
        roll.guild = guild;
        user.guilds = [guild];
        await manager.save([guild, user, roll]);
        return true;
      }
      // We have a user, but no guild.
      const guild = manager.create(Guild, {
        id: guildId,
      });
      roll.user = savedUser;
      roll.guild = guild;
      savedUser.guilds.push(guild);
      await manager.save([guild, savedUser, roll]);
      return true;
    }
    // We have a guild.

    if (!savedUser) {
      const user = manager.create(User, {
        id: userId,
      });
      roll.user = user;
      roll.guild = savedGuild;
      user.guilds = [savedGuild];
      await manager.save([savedGuild, user, roll]);
      return true;
    }

    const savedRoll = await manager.findOne(Roll, {
      where: { name, guild: savedGuild, user: savedUser },
    });
    if (savedRoll) {
      return false;
    }

    roll.user = savedUser;
    roll.guild = savedGuild;
    await manager.save(roll);
    return true;
  }

  private async composeReply(
    interaction: CommandInteraction,
    name: string,
    notation: string,
    options?: {
      firstTime?: boolean;
      confirm?: boolean;
      edit?: boolean;
    }
  ) {
    if (options?.confirm) {
      const reply = await interaction.reply({
        content: `You have already saved a roll with the name \`${name}\`. Would you like to overwrite it?`,
        ephemeral: true,
        fetchReply: true,
        components: AddComponents({
          type: "BUTTON",
          options: [
            { customId: "1", label: "Yes", style: "SUCCESS" },
            { customId: "2", label: "No", style: "DANGER" },
          ],
        }),
      });

      return reply;
    }
    if (options?.edit) {
      return interaction.editReply({
        content: `Roll \`${notation}\` saved as \`${name}\`.`,
        components: [],
      });
    }
    return interaction.reply({
      content: `Roll \`${notation}\` saved as \`${name}\`. ${
        options?.firstTime
          ? "You can include your saved roll when using the `/roll` command by prefixing it with `$`. If you add anything after the saved roll, please make sure to separate it with a space."
          : ""
      }`,
      ephemeral: true,
      fetchReply: true,
    });
  }
}
