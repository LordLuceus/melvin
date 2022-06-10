import { Command, RegisterBehavior } from "@sapphire/framework";
import { CommandInteraction } from "discord.js";
import { Guild } from "../../entities/Guild";
import { Roll } from "../../entities/Roll";
import { User } from "../../entities/User";

export class SaveCommand extends Command {
  constructor(context: Command.Context) {
    super(context, {
      name: "save",
      description: "Save a dice roll for easy access",
      cooldownDelay: 5000,
      cooldownLimit: 1,
      preconditions: ["GuildOnly"],
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
              .setName("name")
              .setDescription("The name by which you'll refer to this roll")
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("value")
              .setDescription("The dice roll to save")
              .setRequired(true)
          ),
      {
        guildIds: ["513474679583801394"],
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      }
    );
  }

  public async chatInputRun(interaction: CommandInteraction) {
    // TODO: Refactor this pile of crap!
    const name = interaction.options.getString("name");
    const notation = interaction.options.getString("value");

    if (name && notation && interaction.guild?.id) {
      const { manager } = this.container.database;
      const savedGuild = await manager.findOne(Guild, {
        where: { id: interaction.guild.id },
      });

      if (!savedGuild) {
        // If the guild is not in the database, we try to find the user in case they already have saved rolls elsewhere (we don't want to blow up their existing rolls!)
        const savedUser = await manager.findOne(User, {
          where: { id: interaction.user.id },
        });
        if (!savedUser) {
          // If there's no user either, we make everything from scratch.
          const roll = manager.create(Roll, { name, value: notation });
          const user = manager.create(User, {
            id: interaction.user.id,
            rolls: [roll],
          });
          const guild = manager.create(Guild, {
            id: interaction.guild.id,
            users: [user],
            rolls: [roll],
          });
          await manager.save(guild);
          return interaction.reply(
            `Roll \`${notation}\` saved as \`${name}\`. You can include your saved roll when using the \`/roll\` command by prefixing it with \`\$\`. If you add anything after the saved roll, please make sure there is a space after it.`
          );
        }
        // We have a user, but no guild.
        const roll = manager.create(Roll, { name, value: notation });
        savedUser.rolls.push(roll);
        const guild = manager.create(Guild, {
          id: interaction.guild.id,
          users: [savedUser],
          rolls: [roll],
        });
        await manager.save(guild);
        return interaction.reply(`Saved roll \`${notation}\` as \`${name}\`.`);
      }
      // We have a guild.
      const savedUser = savedGuild.users.find(
        (u) => u.id === interaction.user.id
      );
      if (!savedUser) {
        // The user might have some rolls saved elsewhere so we need to check.
        const user = await manager.findOne(User, {
          where: { id: interaction.user.id },
        });

        if (!user) {
          const roll = manager.create(Roll, { name, value: notation });
          const user = manager.create(User, {
            id: interaction.user.id,
            rolls: [roll],
          });
          savedGuild.users.push(user);
          savedGuild.rolls.push(roll);
          await manager.save(savedGuild);
          return interaction.reply(
            `Saved roll \`${notation}\` as \`${name}\`.`
          );
        }

        // Check if the user has already saved a roll with the same name.
        if (user.rolls.find((r) => r.name === name)) {
          return interaction.reply(
            "You have already saved a roll with this name."
          );
        }
        const roll = manager.create(Roll, {
          name,
          value: notation,
          guild: savedGuild,
        });
        user.rolls.push(roll);
        savedGuild.users.push(user);
        savedGuild.rolls.push(roll);
        await manager.save(savedGuild);
        return interaction.reply(`Saved roll \`${notation}\` as \`${name}\`.`);
      }

      if (savedUser.rolls.find((r) => r.name === name)) {
        return interaction.reply(
          "You have already saved a roll with that name."
        );
      }

      const roll = manager.create(Roll, { name, value: notation });
      savedUser.rolls.push(roll);
      savedGuild.users.push(savedUser);
      savedGuild.rolls.push(roll);
      await manager.save(savedGuild);
      return interaction.reply(`Roll \`${notation}\` saved as \`${name}\``);
    }
  }
}
