import { Parser } from "@dice-roller/rpg-dice-roller";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import {
  CommandOptionsRunTypeEnum,
  LogLevel,
  RegisterBehavior,
} from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageComponentInteraction,
} from "discord.js";
import { chunkString } from "../../util/chunkString";
import { writeLog } from "../../util/log";

export class RollShortcutCommand extends Subcommand {
  public constructor(
    context: Subcommand.LoaderContext,
    options: Subcommand.Options
  ) {
    super(context, {
      ...options,
      name: "shortcut",
      description: "Use roll shortcuts",
      cooldownDelay: 5000,
      cooldownLimit: 1,
      runIn: CommandOptionsRunTypeEnum.GuildAny,
      subcommands: [
        {
          name: "list",
          chatInputRun: "chatInputList",
        },
        {
          name: "add",
          chatInputRun: "chatInputAdd",
        },
        {
          name: "remove",
          chatInputRun: "chatInputRemove",
        },
      ],
    });
  }

  public override registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addSubcommand((command) =>
            command.setName("list").setDescription("List your roll shortcuts")
          )
          .addSubcommand((command) =>
            command
              .setName("add")
              .setDescription("Add a roll shortcut")
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
              )
          )
          .addSubcommand((command) =>
            command
              .setName("remove")
              .setDescription("Remove roll shortcuts")
              .addStringOption((option) =>
                option
                  .setName("roll")
                  .setDescription("The roll to clear")
                  .setAutocomplete(true)
              )
          ),
      { behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
    );
  }

  public async chatInputList(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
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
      return interaction.reply({
        content: `What the frig? \`${err.message}\``,
        ephemeral: true,
      });
    }

    return null;
  }

  public async chatInputAdd(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    const name = interaction.options
      .getString("name", true)
      .toLowerCase()
      .trim();
    const notation = interaction.options
      .getString("value", true)
      .toLowerCase()
      .trim();

    const { guild } = interaction;

    if (guild) {
      try {
        try {
          Parser.parse(notation);
        } catch (err: any) {
          writeLog(LogLevel.Error, this.name, err.message);
          return interaction.reply({
            content: `\`${notation}\` is not a valid dice notation.`,
            ephemeral: true,
          });
        }

        const regex = /\W+/;
        if (regex.test(name)) {
          return interaction.reply({
            content: "A roll shortcut cannot contain any special characters.",
            ephemeral: true,
          });
        }

        const savedUser = await this.findUser(interaction.user.id);

        const saved = await this.save(
          name,
          notation,
          interaction.user.id,
          guild.id
        );

        if (!saved) {
          const reply = await RollShortcutCommand.composeReply(
            interaction,
            name,
            notation,
            {
              confirm: true,
            }
          );

          const filter = (i: MessageComponentInteraction) => {
            i.deferUpdate();
            return i.user.id === interaction.user.id;
          };

          if (isMessageInstance(reply)) {
            const response = await reply.awaitMessageComponent({
              filter,
              componentType: ComponentType.Button,
              time: 30000,
            });

            if (response.customId === "1") {
              await this.save(
                name,
                notation,
                interaction.user.id,
                guild.id,
                true
              );

              return RollShortcutCommand.composeReply(
                interaction,
                name,
                notation,
                {
                  edit: true,
                }
              );
            }

            return interaction.editReply({
              content: "Okay. The roll shortcut will not be overwritten.",
              components: [],
            });
          }
        }

        return RollShortcutCommand.composeReply(interaction, name, notation, {
          firstTime: !savedUser,
        });
      } catch (err: any) {
        writeLog(LogLevel.Error, this.name, err.message);
        return interaction.reply({
          content: `What the frig? \`${err.message}\``,
          ephemeral: true,
        });
      }
    }

    return null;
  }

  public async chatInputRemove(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
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

  private async findUser(id: string) {
    const { user } = this.container.prisma;

    const savedUser = await user.findUnique({
      where: { id },
    });

    return savedUser;
  }

  private async save(
    name: string,
    notation: string,
    userId: string,
    guildId: string,
    overwrite?: boolean
  ): Promise<boolean> {
    const { prisma } = this.container;

    if (overwrite) {
      const savedRoll = await prisma.roll.findFirstOrThrow({
        where: { name, guildId, userId },
      });

      await prisma.roll.update({
        where: { id: savedRoll.id },
        data: { value: notation },
      });

      return true;
    }

    const savedRoll = await prisma.roll.findFirst({
      where: { name, guildId, userId },
    });

    if (savedRoll) {
      return false;
    }

    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
      },
      update: {},
    });

    await prisma.guild.upsert({
      where: { id: guildId },
      create: {
        id: guildId,
        users: {
          connect: {
            id: userId,
          },
        },
      },
      update: {},
    });

    await prisma.roll.create({
      data: {
        name,
        value: notation,
        user: { connect: { id: userId } },
        guild: { connect: { id: guildId } },
      },
    });

    return true;
  }

  private static async composeReply(
    interaction: Subcommand.ChatInputCommandInteraction,
    name: string,
    notation: string,
    options?: {
      firstTime?: boolean;
      confirm?: boolean;
      edit?: boolean;
    }
  ) {
    if (options?.confirm) {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("1")
          .setLabel("Yes")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("2")
          .setLabel("No")
          .setStyle(ButtonStyle.Secondary)
      );

      const reply = await interaction.reply({
        content: `You have already saved a roll shortcut with the name \`${name}\`. Would you like to overwrite it?`,
        ephemeral: true,
        fetchReply: true,
        components: [row],
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
          ? "You can include your roll shortcuts when using the `/roll` command by just typing their names. They will automatically be replaced with their corresponding values."
          : ""
      }`,
      ephemeral: true,
      fetchReply: true,
    });
  }
}
