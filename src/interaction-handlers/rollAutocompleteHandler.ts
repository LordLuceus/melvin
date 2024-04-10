import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import type { AutocompleteInteraction } from "discord.js";

export class RollAutocompleteHandler extends InteractionHandler {
  public constructor(
    context: InteractionHandler.LoaderContext,
    options: InteractionHandler.Options
  ) {
    super(context, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Autocomplete,
    });
  }

  public override async run(
    interaction: AutocompleteInteraction,
    result: InteractionHandler.ParseResult<this>
  ) {
    return interaction.respond(result);
  }

  public override async parse(interaction: AutocompleteInteraction) {
    if (interaction.commandName !== "shortcut") return this.none();

    const focusedOption = interaction.options.getFocused(true);

    switch (focusedOption.name) {
      case "roll": {
        const { roll } = this.container.prisma;

        const savedRolls = await roll.findMany({
          where: {
            user: { id: interaction.user.id },
            guild: { id: interaction.guildId as string },
            name: {
              contains: focusedOption.value,
              mode: "insensitive",
            },
          },
          take: 20,
        });

        return this.some(
          savedRolls.map((r) => ({ name: r.name, value: r.name }))
        );
      }
      default: {
        return this.none();
      }
    }
  }
}
