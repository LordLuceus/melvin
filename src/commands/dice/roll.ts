import type { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { Command, LogLevel, RegisterBehavior } from "@sapphire/framework";
import type { CommandInteraction, TextChannel } from "discord.js";
import { Guild } from "../../entities/Guild";
import { chunkString } from "../../util/chunkString";
import { writeLog } from "../../util/log";
import { rollDice } from "../../util/rollDice";

export default class RollCommand extends Command {
  constructor(context: Command.Context) {
    super(context, {
      name: "roll",
      description: "Roll dice",
      cooldownLimit: 1,
      cooldownDelay: 3000,
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

  public async chatInputRun(interaction: CommandInteraction) {
    const notation = interaction.options
      .getString("dice")
      ?.toLowerCase()
      .trim();
    const repetitions = interaction.options.getInteger("repetitions");
    const display = interaction.options.getString("output") || "output";
    const secret = interaction.options.getBoolean("secret");

    if (notation) {
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
        return this.composeReply(interaction, roll, display, secret);
      } catch (err: any) {
        return this.handleError(err, interaction);
      }
    }
    return null;
  }

  private handleError(err: any, interaction: CommandInteraction) {
    writeLog(LogLevel.Error, this.name, err.message);
    return interaction.reply(
      `${interaction.user.toString()}: What the frig? Foolish Steve! \`${
        err.message
      }\``
    );
  }

  private async composeReply(
    interaction: CommandInteraction,
    roll: DiceRoll | DiceRoll[],
    output: string,
    secret: boolean | null = false
  ) {
    const author = interaction.user.toString();
    let result: string;
    let gmChannel: TextChannel | null = null;

    if (output === "output") {
      result = Array.isArray(roll)
        ? roll.map((r) => r.output).join("\n")
        : roll.output;
    } else {
      result = Array.isArray(roll)
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

    const reply = `${author}: ${result}`;

    if (secret) {
      gmChannel = await this.getGmChannel(interaction);
      if (!gmChannel) {
        return interaction.reply(
          "The GM channel must be set to use the secret option."
        );
      }

      if (
        interaction.guild?.me &&
        !gmChannel.permissionsFor(interaction.guild.me)?.has("SEND_MESSAGES")
      ) {
        return interaction.reply(
          `I do not have permission to send messages in ${gmChannel}. Please update my permissions and try again.`
        );
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
    interaction: CommandInteraction
  ): Promise<TextChannel | null> {
    const { manager } = this.container.database;
    const { guild } = interaction;
    if (!guild) return null;

    const savedGuild = await manager.findOne(Guild, {
      where: { id: guild.id },
    });

    if (!savedGuild?.gmChannel) return null;

    const gmChannel = guild.channels.cache.get(savedGuild.gmChannel);
    if (!gmChannel) return null;

    if (!gmChannel.isText()) return null;
    return gmChannel as TextChannel;
  }
}
