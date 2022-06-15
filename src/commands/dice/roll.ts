import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { Command, LogLevel, RegisterBehavior } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";
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
          ),
      {
        guildIds: ["513474679583801394"],
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

    if (notation) {
      if (repetitions) {
        try {
          const rolls = await rollDice(
            Array(repetitions).fill(notation),
            interaction.user.id,
            interaction.guild?.id
          );
          return RollCommand.composeReply(interaction, rolls, display);
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
        return RollCommand.composeReply(interaction, roll, display);
      } catch (err: any) {
        return this.handleError(err, interaction);
      }
    }
    return null;
  }

  private handleError(err: any, interaction: CommandInteraction) {
    writeLog(LogLevel.Error, this.name, err.message);
    return interaction.reply(
      `${interaction.user.toString()}: What the frig? Foolish Steve! ${
        err.message
      }`
    );
  }

  private static composeReply(
    interaction: CommandInteraction,
    roll: DiceRoll | DiceRoll[],
    output: string
  ) {
    const author = interaction.user.toString();
    let result: string;
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
    return interaction.reply(`${author}: ${result}`);
  }
}
