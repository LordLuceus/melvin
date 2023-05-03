import { Parser } from "@dice-roller/rpg-dice-roller";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import {
  ChatInputCommand,
  Command,
  LogLevel,
  RegisterBehavior,
} from "@sapphire/framework";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageComponentInteraction,
} from "discord.js";
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

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry
  ) {
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
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      }
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
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
          const reply = await SaveCommand.composeReply(
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

              return SaveCommand.composeReply(interaction, name, notation, {
                edit: true,
              });
            }

            return interaction.editReply({
              content: "Okay. The roll shortcut will not be overwritten.",
              components: [],
            });
          }
        }

        return SaveCommand.composeReply(interaction, name, notation, {
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
    interaction: Command.ChatInputCommandInteraction,
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
