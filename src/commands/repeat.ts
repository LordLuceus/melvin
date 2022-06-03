import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { Command } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";

export class RepeatCommand extends Command {
  constructor(context: Command.Context) {
    super(context, {
      name: "repeat",
      description: "Repeat a dice roll multiple times",
      cooldownDelay: 3000,
      cooldownLimit: 1,
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addIntegerOption((option) =>
            option
              .setName("repetitions")
              .setDescription("The number of times to repeat the roll")
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("dice")
              .setDescription("The dice to roll")
              .setRequired(true)
          ),
      { guildIds: ["513474679583801394"] }
    );
  }

  public override async chatInputRun(interaction: CommandInteraction) {
    const repetitions = interaction.options.getInteger("repetitions");
    const notation = interaction.options.getString("dice");

    if (repetitions && notation) {
      const rolls = [];

      for (let i = 0; i < repetitions; i++) {
        const roll = new DiceRoll(notation);
        rolls.push(roll.output);
      }

      const author = interaction.member?.toString();
      const replies = rolls.map((r, i) => {
        if (i === 0) {
          return `${author}, ${r}`;
        }
        return `${r}`;
      });
      const followups = replies.slice(1);

      await interaction.reply(replies[0]);
      for (const reply of followups) {
        await interaction.followUp(reply);
      }
    }
  }
}
