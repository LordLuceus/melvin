import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import type { AutocompleteInteraction } from "discord.js";

export class GroupAutocompleteHandler extends InteractionHandler {
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
    if (!interaction.guild) {
      return this.none();
    }

    if (interaction.commandName !== "group") return this.none();

    const focusedOption = interaction.options.getFocused(true);

    switch (focusedOption.name) {
      case "group": {
        const { rollGroup } = this.container.prisma;

        const savedGroups = await rollGroup.findMany({
          where: {
            user: { id: interaction.user.id },
            guild: { id: interaction.guild.id },
            name: {
              contains: focusedOption.value,
              mode: "insensitive",
            },
          },
          take: 20,
        });

        return this.some(
          savedGroups.map((r) => ({ name: r.name, value: r.name }))
        );
      }
      default: {
        return this.none();
      }
    }
  }
}
