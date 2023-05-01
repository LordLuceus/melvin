import { Command, RegisterBehavior } from "@sapphire/framework";
import { ChannelType } from "discord-api-types/v10";
import { CommandInteraction, TextChannel } from "discord.js";

export class GMCommand extends Command {
  constructor(context: Command.Context) {
    super(context, {
      name: "gm",
      description: "Set the game master channel for the server",
      preconditions: ["GuildOnly"],
      cooldownDelay: 5000,
      cooldownLimit: 1,
      requiredUserPermissions: ["MANAGE_GUILD"],
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addChannelOption((option) =>
            option
              .setName("channel")
              .setDescription("The channel to set as the game master channel")
              .setRequired(false)
              .addChannelTypes(ChannelType.GuildText)
          ),
      {
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      }
    );
  }

  public async chatInputRun(interaction: CommandInteraction) {
    const { prisma } = this.container;
    const channel = interaction.options.getChannel("channel") as TextChannel;
    const { guild } = interaction;

    const savedGuild = await prisma.guild.findUnique({
      where: { id: guild?.id },
    });

    if (!channel) {
      if (!savedGuild?.gmChannel) {
        return interaction.reply({
          content: `The game master channel has not been set. Please specify a channel to set as the game master channel.`,
          ephemeral: true,
        });
      }

      return interaction.reply({
        content: `The game master channel is currently set to <#${savedGuild.gmChannel}>.`,
        ephemeral: true,
      });
    }

    if (guild) {
      try {
        if (
          guild.members.me &&
          !channel.permissionsFor(guild.members.me)?.has("SEND_MESSAGES")
        ) {
          return await interaction.reply({
            content: `I don't have permission to send messages in ${channel}. Please give me permission to send messages in that channel and try again, or choose a different channel.`,
            ephemeral: true,
          });
        }

        if (!savedGuild) {
          await prisma.guild.create({
            data: {
              id: guild.id,
              gmChannel: channel.id,
            },
          });

          return await interaction.reply({
            content: `The game master channel has been set to ${channel}`,
            ephemeral: true,
          });
        }

        if (savedGuild.gmChannel === channel.id) {
          return await interaction.reply({
            content: `The game master channel is already set to ${channel}`,
            ephemeral: true,
          });
        }

        await prisma.guild.update({
          where: { id: guild.id },
          data: {
            gmChannel: channel.id,
          },
        });

        return await interaction.reply({
          content: `The game master channel has been set to ${channel}`,
          ephemeral: true,
        });
      } catch (err: any) {
        await interaction.reply({
          content: `There was an error setting the game master channel: ${err.message}`,
          ephemeral: true,
        });
      }
    }

    return null;
  }
}
