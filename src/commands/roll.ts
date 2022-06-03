import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { Command } from "@sapphire/framework";
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
          ),
      { guildIds: ["513474679583801394"] }
    );
  }

  public chatInputRun(interaction: CommandInteraction) {
    const notation = interaction.options.getString("dice");

    if (notation) {
      const roll = new DiceRoll(notation);
      const author = interaction.member?.toString();
      const reply =
        roll.output.length > 2000
          ? `${author}, ${roll.notation} = ${roll.total}`
          : `${author}, ${roll.output}`;
      return interaction.reply(reply);
    }
  }
}
