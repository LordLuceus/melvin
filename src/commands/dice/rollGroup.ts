import {
  CommandOptionsRunTypeEnum,
  LogLevel,
  RegisterBehavior,
} from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { chunkString, writeLog } from "../../util";

export class RollGroupCommand extends Subcommand {
  public constructor(
    context: Subcommand.LoaderContext,
    options: Subcommand.Options
  ) {
    super(context, {
      ...options,
      name: "group",
      description: "Use roll groups",
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
        {
          name: "create",
          chatInputRun: "chatInputCreate",
        },
        {
          name: "delete",
          chatInputRun: "chatInputDelete",
        },
        {
          name: "view",
          chatInputRun: "chatInputView",
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
            command.setName("list").setDescription("List your roll groups")
          )
          .addSubcommand((command) =>
            command
              .setName("add")
              .setDescription("Add a roll shortcut to a group")
              .addStringOption((option) =>
                option
                  .setName("group")
                  .setDescription("The group to add the roll to")
                  .setRequired(true)
                  .setAutocomplete(true)
              )
              .addStringOption((option) =>
                option
                  .setName("roll")
                  .setDescription("The shortcut to add to the group")
                  .setRequired(true)
                  .setAutocomplete(true)
              )
          )
          .addSubcommand((command) =>
            command
              .setName("remove")
              .setDescription("Remove a roll shortcut from a group")
              .addStringOption((option) =>
                option
                  .setName("group")
                  .setDescription("The group to remove the roll from")
                  .setRequired(true)
                  .setAutocomplete(true)
              )
              .addStringOption((option) =>
                option
                  .setName("roll")
                  .setDescription("The shortcut to remove from the group")
                  .setRequired(true)
                  .setAutocomplete(true)
              )
          )
          .addSubcommand((command) =>
            command
              .setName("create")
              .setDescription("Create a new group")
              .addStringOption((option) =>
                option
                  .setName("name")
                  .setDescription("The name of the new group")
                  .setRequired(true)
              )
          )
          .addSubcommand((command) =>
            command
              .setName("delete")
              .setDescription("Delete a group")
              .addStringOption((option) =>
                option
                  .setName("group")
                  .setDescription("The group to delete")
                  .setRequired(true)
                  .setAutocomplete(true)
              )
          )
          .addSubcommand((command) =>
            command
              .setName("view")
              .setDescription("View a group")
              .addStringOption((option) =>
                option
                  .setName("group")
                  .setDescription("The group to view")
                  .setRequired(true)
                  .setAutocomplete(true)
              )
          ),
      { behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
    );
  }

  public async chatInputList(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    if (!interaction.guild) return null;
    const { prisma } = this.container;

    try {
      const savedUser = await this.findUser(interaction.user.id);

      if (!savedUser) {
        return interaction.reply({
          content:
            "You have no saved groups. Try using the `/group create` command.",
          ephemeral: true,
        });
      }

      const savedGuild = await this.findGuild(interaction.guild.id);

      if (!savedGuild) {
        return interaction.reply({
          content: "You haven't saved any roll groups in this server.",
          ephemeral: true,
        });
      }

      const groups = await prisma.rollGroup.findMany({
        where: {
          guild: { id: interaction.guild.id },
          user: { id: interaction.user.id },
        },
        include: {
          rolls: true,
        },
      });

      if (groups.length === 0) {
        return interaction.reply({
          content: "No roll groups found.",
          ephemeral: true,
        });
      }

      const groupList = groups.map(
        (g) =>
          `${g.name} (${g.rolls.length} roll${g.rolls.length === 1 ? "" : "s"})`
      );
      const reply = groupList.join("\n");
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
    } catch (err: any) {
      writeLog(LogLevel.Error, this.name, err.message);
      return interaction.reply({
        content: `What the frig? \`${err.message}\``,
        ephemeral: true,
      });
    }
  }

  public async chatInputAdd(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    const { guild } = interaction;
    if (!guild) return null;

    const { prisma } = this.container;

    const group = interaction.options
      .getString("group", true)
      .toLowerCase()
      .trim();
    const shortcut = interaction.options
      .getString("roll", true)
      .toLowerCase()
      .trim();

    try {
      const savedUser = await this.findUser(interaction.user.id);

      if (!savedUser) {
        return interaction.reply({
          content: "You must create a group before using this command.",
          ephemeral: true,
        });
      }

      const savedGuild = await this.findGuild(guild.id);

      if (!savedGuild) {
        return interaction.reply({
          content: "You must create a group before using this command.",
          ephemeral: true,
        });
      }

      const savedRoll = await prisma.roll.findFirst({
        where: {
          name: shortcut,
          guildId: guild.id,
          userId: interaction.user.id,
        },
        include: {
          groups: true,
        },
      });

      if (!savedRoll) {
        return interaction.reply({
          content: `The roll shortcut \`${shortcut}\` does not exist.`,
          ephemeral: true,
        });
      }

      const savedGroup = await prisma.rollGroup.findFirst({
        where: { name: group, guildId: guild.id, userId: interaction.user.id },
        include: {
          rolls: true,
        },
      });

      if (!savedGroup) {
        if (RollGroupCommand.hasSpecialCharacters(group)) {
          return interaction.reply({
            content: "A group name cannot contain any special characters.",
            ephemeral: true,
          });
        }

        await prisma.rollGroup.create({
          data: {
            name: group,
            userId: interaction.user.id,
            guildId: guild.id,
            rolls: {
              connect: {
                id: savedRoll.id,
              },
            },
          },
        });

        return interaction.reply({
          content: `The group \`${group}\` has been created and the roll shortcut \`${shortcut}\` has been added to it. Use this command again to add more roll shortcuts to the group.`,
          ephemeral: true,
        });
      }

      if (savedGroup.rolls.some((r) => r.id === savedRoll.id)) {
        return interaction.reply({
          content: `The roll shortcut \`${shortcut}\` is already in the group \`${group}\`.`,
          ephemeral: true,
        });
      }

      await prisma.rollGroup.update({
        where: { id: savedGroup.id },
        data: {
          rolls: {
            connect: {
              id: savedRoll.id,
            },
          },
        },
      });

      return interaction.reply({
        content: `The roll shortcut \`${shortcut}\` has been added to the group \`${group}\`.`,
        ephemeral: true,
      });
    } catch (err: any) {
      writeLog(LogLevel.Error, this.name, err.message);
      return interaction.reply({
        content: `What the frig? \`${err.message}\``,
        ephemeral: true,
      });
    }
  }

  public async chatInputRemove(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    if (!interaction.guild) return null;

    const { prisma } = this.container;

    const group = interaction.options
      .getString("group", true)
      ?.toLowerCase()
      .trim();
    const roll = interaction.options
      .getString("roll", true)
      ?.toLowerCase()
      .trim();

    try {
      const savedUser = await this.findUser(interaction.user.id);

      if (!savedUser) {
        return interaction.reply({
          content: "You have not saved any roll shortcuts.",
          ephemeral: true,
        });
      }

      const savedGuild = await this.findGuild(interaction.guild.id);

      if (!savedGuild) {
        return interaction.reply({
          content: "You have not saved anything on this server.",
          ephemeral: true,
        });
      }

      const savedGroup = await prisma.rollGroup.findFirst({
        where: {
          name: group,
          guildId: interaction.guild.id,
          userId: interaction.user.id,
        },
        include: {
          rolls: true,
        },
      });

      if (!savedGroup) {
        return interaction.reply({
          content: `The group \`${group}\` does not exist.`,
          ephemeral: true,
        });
      }

      const savedRoll = await prisma.roll.findFirst({
        where: {
          name: roll,
          guildId: interaction.guild.id,
          userId: interaction.user.id,
        },
        include: {
          groups: true,
        },
      });

      if (!savedRoll) {
        return interaction.reply({
          content: `The roll shortcut \`${roll}\` does not exist.`,
          ephemeral: true,
        });
      }

      if (!savedGroup.rolls.some((r) => r.id === savedRoll.id)) {
        return interaction.reply({
          content: `The roll shortcut \`${roll}\` is not in the group \`${group}\`.`,
          ephemeral: true,
        });
      }

      await prisma.rollGroup.update({
        where: { id: savedGroup.id },
        data: {
          rolls: {
            disconnect: {
              id: savedRoll.id,
            },
          },
        },
      });

      return interaction.reply({
        content: `The roll shortcut \`${roll}\` has been removed from the group \`${group}\`.`,
        ephemeral: true,
      });
    } catch (err: any) {
      writeLog(LogLevel.Error, this.name, err.message);
      return interaction.reply(`What the frig? \`${err.message}\``);
    }
  }

  public async chatInputCreate(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    const { guild } = interaction;
    if (!guild) return null;

    const { prisma } = this.container;

    const name = interaction.options
      .getString("name", true)
      ?.toLowerCase()
      .trim();

    try {
      let savedUser = await this.findUser(interaction.user.id);

      if (!savedUser) {
        savedUser = await prisma.user.create({
          data: {
            id: interaction.user.id,
          },
        });
      }

      let savedGuild = await this.findGuild(guild.id);

      if (!savedGuild) {
        savedGuild = await prisma.guild.create({
          data: {
            id: guild.id,
            gmChannel: null,
          },
        });
      }

      const savedGroup = await prisma.rollGroup.findFirst({
        where: { name, guildId: guild.id, userId: interaction.user.id },
        include: {
          rolls: true,
        },
      });

      if (savedGroup) {
        return interaction.reply({
          content: `The group \`${name}\` already exists.`,
          ephemeral: true,
        });
      }

      if (RollGroupCommand.hasSpecialCharacters(name)) {
        return interaction.reply({
          content: "A group name cannot contain any special characters.",
          ephemeral: true,
        });
      }

      await prisma.rollGroup.create({
        data: {
          name,
          userId: interaction.user.id,
          guildId: guild.id,
        },
      });

      return interaction.reply({
        content: `Created group \`${name}\`. Use the \`/group add\` command to add roll shortcuts to the group.`,
        ephemeral: true,
      });
    } catch (err: any) {
      writeLog(LogLevel.Error, this.name, err.message);
      return interaction.reply({
        content: `What the frig? \`${err.message}\``,
        ephemeral: true,
      });
    }
  }

  public async chatInputDelete(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    const { guild } = interaction;
    if (!guild) return null;

    const { prisma } = this.container;

    const group = interaction.options
      .getString("group", true)
      ?.toLowerCase()
      .trim();

    try {
      const savedUser = await this.findUser(interaction.user.id);

      if (!savedUser) {
        return interaction.reply({
          content: "You have not saved any groups.",
          ephemeral: true,
        });
      }

      const savedGuild = await this.findGuild(guild.id);

      if (!savedGuild) {
        return interaction.reply({
          content: "You haven't saved any groups on this server.",
          ephemeral: true,
        });
      }

      const savedGroup = await prisma.rollGroup.findFirst({
        where: {
          name: group,
          guildId: guild.id,
          userId: interaction.user.id,
        },
      });

      if (!savedGroup) {
        return interaction.reply({
          content: `The group \`${group}\` does not exist.`,
          ephemeral: true,
        });
      }

      await prisma.rollGroup.delete({
        where: { id: savedGroup.id },
      });

      return interaction.reply({
        content: `Deleted group \`${group}\`.`,
        ephemeral: true,
      });
    } catch (err: any) {
      writeLog(LogLevel.Error, this.name, err.message);
      return interaction.reply(`What the frig? \`${err.message}\``);
    }
  }

  public async chatInputView(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    const { guild } = interaction;
    if (!guild) return null;

    const { prisma } = this.container;

    const group = interaction.options
      .getString("group", true)
      ?.toLowerCase()
      .trim();

    try {
      const savedUser = await this.findUser(interaction.user.id);

      if (!savedUser) {
        return interaction.reply({
          content: "You have not saved any groups.",
          ephemeral: true,
        });
      }

      const savedGuild = await this.findGuild(guild.id);

      if (!savedGuild) {
        return interaction.reply({
          content: "You haven't saved any groups on this server.",
          ephemeral: true,
        });
      }

      const savedGroup = await prisma.rollGroup.findFirst({
        where: {
          name: group,
          guildId: guild.id,
          userId: interaction.user.id,
        },
        include: {
          rolls: true,
        },
      });

      if (!savedGroup) {
        return interaction.reply({
          content: `The group \`${group}\` does not exist.`,
          ephemeral: true,
        });
      }

      if (savedGroup.rolls.length === 0) {
        return interaction.reply({
          content:
            "No roll shortcuts in this group. Use the `/group add` command to add roll shortcuts to the group.",
          ephemeral: true,
        });
      }

      const rollList = savedGroup.rolls.map((r) => `${r.name}: ${r.value}`);
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
    } catch (err: any) {
      writeLog(LogLevel.Error, this.name, err.message);
      return interaction.reply({
        content: `What the frig? \`${err.message}\``,
        ephemeral: true,
      });
    }
  }

  private async findUser(id: string) {
    const { user } = this.container.prisma;

    const savedUser = await user.findUnique({
      where: { id },
    });

    return savedUser;
  }

  private async findGuild(id: string) {
    const { guild } = this.container.prisma;

    const savedGuild = await guild.findUnique({
      where: { id },
    });

    return savedGuild;
  }

  private static hasSpecialCharacters(name: string): boolean {
    const regex = /[^a-zA-Z0-9-_ ]/g;
    return regex.test(name);
  }
}
