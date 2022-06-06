import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { Command, RegisterBehavior } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";

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
              .setRequired(false)
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
              .setRequired(false)
          ),
      {
        guildIds: ["513474679583801394"],
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      }
    );
  }

  public async chatInputRun(interaction: CommandInteraction) {
    const notation = interaction.options.getString("dice");
    const repetitions = interaction.options.getInteger("repetitions");
    const display = interaction.options.getString("output") || "output";

    if (notation) {
      if (repetitions) {
        const rolls: DiceRoll[] = [];

        for (let i = 0; i < repetitions; i++) {
          const roll = new DiceRoll(notation);
          rolls.push(roll);
        }

        const author = interaction.member?.toString();
        const replies = rolls.map((r, i) => {
          if (i === 0) {
            return `${author}, ${r[display as keyof typeof r]}`;
          }
          return `${r[display as keyof typeof r]}`;
        });
        const followups = replies.slice(1);

        await interaction.reply(replies[0]);
        for (const reply of followups) {
          await interaction.followUp(reply);
        }
        return;
      }
      const roll = new DiceRoll(notation);
      const author = interaction.member?.toString();
      const reply = `${author}, ${roll[display as keyof typeof roll]}`;
      return interaction.reply(reply);
    }
  }
}
