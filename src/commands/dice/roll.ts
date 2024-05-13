import type { DiceRoll } from "@dice-roller/rpg-dice-roller";
import type { RollResults } from "@dice-roller/rpg-dice-roller/types/results";
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from "@discordjs/voice";
import {
  ChatInputCommand,
  Command,
  LogLevel,
  RegisterBehavior,
} from "@sapphire/framework";
import {
  ChannelType,
  GuildMember,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import {
  RollResult,
  chunkString,
  hasD20,
  rollDice,
  writeLog,
} from "../../util";

export class RollCommand extends Command {
  constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: "roll",
      description: "Roll dice",
      cooldownLimit: 1,
      cooldownDelay: 3000,
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
              .setName("dice")
              .setDescription("The dice to roll")
              .setRequired(true)
          )
          .addIntegerOption((option) =>
            option
              .setName("repetitions")
              .setDescription("The number of times to roll the dice")
              .setMinValue(2)
              .setMaxValue(10)
          )
          .addStringOption((option) =>
            option
              .setName("output")
              .setDescription(
                "Display the average, minimum, or maximum possible value for the provided dice"
              )
              .addChoices(
                { name: "average", value: "averageTotal" },
                { name: "minimum", value: "minTotal" },
                { name: "maximum", value: "maxTotal" }
              )
          )
          .addBooleanOption((option) =>
            option
              .setName("secret")
              .setDescription("Only show the result to the game master")
          ),
      {
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      }
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const notation = interaction.options
      .getString("dice", true)
      .toLowerCase()
      .trim();
    const repetitions = interaction.options.getInteger("repetitions");
    const display = interaction.options.getString("output") || "output";
    const secret = interaction.options.getBoolean("secret");

    if (repetitions) {
      try {
        const rolls = await rollDice(
          Array(repetitions).fill(notation),
          interaction.user.id,
          interaction.guild?.id
        );

        return this.composeReply(interaction, rolls, display, secret);
      } catch (err: any) {
        return this.handleError(err, interaction);
      }
    }

    try {
      const roll = await rollDice(
        notation,
        interaction.user.id,
        interaction.guild?.id
      );

      RollCommand.laugh(roll.roll as DiceRoll, interaction, display, secret);

      return this.composeReply(interaction, roll, display, secret);
    } catch (err: any) {
      return this.handleError(err, interaction);
    }
  }

  private static laugh(
    roll: DiceRoll,
    interaction: Command.ChatInputCommandInteraction,
    output: string,
    secret: boolean | null
  ) {
    if (output !== "output" || secret) return;

    if (hasD20(roll.notation)) {
      const result = (roll.rolls[0] as RollResults).value;

      if (result === 1) {
        const { member } = interaction;

        if (member instanceof GuildMember && member.voice.channel) {
          const player = createAudioPlayer();
          const audio = createAudioResource("./assets/Melvin_Laugh-001.ogg");
          player.play(audio);
          const connection = joinVoiceChannel({
            channelId: member.voice.channel?.id,
            guildId: member.guild.id,
            adapterCreator: member.guild.voiceAdapterCreator,
          });
          connection.subscribe(player);

          player.on("stateChange", (oldState, newState) => {
            if (
              oldState.status === AudioPlayerStatus.Playing &&
              newState.status === AudioPlayerStatus.Idle
            ) {
              connection.destroy();
            }
          });
        }
      }
    }
  }

  private handleError(
    err: any,
    interaction: Command.ChatInputCommandInteraction
  ) {
    writeLog(LogLevel.Error, this.name, err.message);
    return interaction.reply(
      `${interaction.user.toString()}: What the frig? Foolish Steve! \`${
        err.message
      }\``
    );
  }

  private async composeReply(
    interaction: Command.ChatInputCommandInteraction,
    result: RollResult,
    output: string,
    secret: boolean | null = false
  ) {
    const { roll, hasShortcut } = result;
    const author = interaction.user.toString();
    let display: string;
    let gmChannel: TextChannel | null = null;

    if (output === "output") {
      // eslint-disable-next-line no-nested-ternary
      display = Array.isArray(roll)
        ? roll
            .map((r) =>
              hasShortcut ? `${r.originalNotation} => ${r.output}` : r.output
            )
            .join("\n")
        : hasShortcut
        ? `${roll.originalNotation} => ${roll.output}`
        : roll.output;
    } else {
      display = Array.isArray(roll)
        ? roll
            .map(
              (r) =>
                `${r.notation} [${output.slice(0, -5)}]: ${
                  r[output as keyof typeof r]
                }`
            )
            .join("\n")
        : `${roll.notation} [${output.slice(0, -5)}]: ${
            roll[output as keyof typeof roll]
          }`;
    }

    const reply = `${author}: ${display}`;

    if (secret) {
      gmChannel = await this.getGmChannel(interaction);
      if (!gmChannel) {
        return interaction.reply({
          content: "The GM channel must be set to use the secret option.",
          ephemeral: true,
        });
      }

      if (
        interaction.guild?.members.me &&
        !gmChannel
          .permissionsFor(interaction.guild.members.me)
          ?.has(PermissionFlagsBits.SendMessages)
      ) {
        return interaction.reply({
          content: `I do not have permission to send messages in ${gmChannel}. Please update my permissions and try again.`,
          ephemeral: true,
        });
      }
    }

    if (reply.length > 2000) {
      const messages = chunkString(reply, ["\n", ", "]);
      const followups = messages.slice(1);

      if (!secret || gmChannel === interaction.channel) {
        await interaction.reply(messages[0]);
        return followups.forEach((r) => interaction.followUp(r));
      }

      try {
        messages.forEach((r) => gmChannel?.send(r));
        return await interaction.reply({
          content: "Result sent to the GM channel.",
          ephemeral: true,
        });
      } catch (err: any) {
        writeLog(LogLevel.Error, this.name, err.message);

        return interaction.reply({
          content: `There was an error sending the result to the GM channel: \`${err.message}\``,
          ephemeral: true,
        });
      }
    }

    if (!secret || gmChannel === interaction.channel) {
      return interaction.reply(reply);
    }

    try {
      gmChannel?.send(reply);

      return await interaction.reply({
        content: "Result sent to the GM channel.",
        ephemeral: true,
      });
    } catch (err: any) {
      writeLog(LogLevel.Error, this.name, err.message);

      return interaction.reply({
        content: `There was an error sending the result to the GM channel: \`${err.message}\``,
        ephemeral: true,
      });
    }
  }

  private async getGmChannel(
    interaction: Command.ChatInputCommandInteraction
  ): Promise<TextChannel | null> {
    const { prisma } = this.container;

    const { guild } = interaction;
    if (!guild) return null;

    const savedGuild = await prisma.guild.findUnique({
      where: { id: guild.id },
    });

    if (!savedGuild?.gmChannel) return null;

    const gmChannel = guild.channels.cache.get(savedGuild.gmChannel);
    if (!gmChannel) return null;

    if (gmChannel.type !== ChannelType.GuildText) return null;
    return gmChannel;
  }
}
