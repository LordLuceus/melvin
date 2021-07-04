import { CollectorFilter, MessageReaction, User } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

interface RollSettings {
  [key: string]: {
    [key: string]: string;
  };
}

export default class SaveCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "save",
      description: "Save a dice roll for easy access",
      group: "dice",
      memberName: "save",
      throttling: {
        usages: 1,
        duration: 5,
      },
      examples: ["?save fireball 8d6", "?save coneOfCold 8d8min2+5"],
      guildOnly: true,
      args: [
        {
          key: "name",
          prompt: "What are you trying to save?",
          type: "string",
        },
        {
          key: "value",
          prompt: "What value are you saving?",
          type: "string",
        },
      ],
    });
  }

  async run(
    message: CommandoMessage,
    { name, value }: { name: string; value: string }
  ) {
    let savedSettings = this.client.provider.get(message.guild, "rolls");
    if (!savedSettings) {
      savedSettings = await this.client.provider.set(
        message.guild,
        "rolls",
        JSON.stringify({})
      );
    }

    const parsedSettings: RollSettings = JSON.parse(savedSettings);
    if (
      parsedSettings[message.author.id] &&
      parsedSettings[message.author.id][name]
    ) {
      const filter: CollectorFilter = (
        reaction: MessageReaction,
        user: User
      ) => {
        return (
          ["😄", "😦"].includes(reaction.emoji.name) &&
          user.id === message.author.id
        );
      };

      const reply = await message.reply(
        `The roll \`${name}\` already exists. Do you want to overwrite it?`
      );
      await reply.react("😄");
      await reply.react("😦");

      try {
        const collected = await reply.awaitReactions(filter, {
          max: 1,
          time: 30000,
          errors: ["time"],
        });
        const reaction = collected.first();

        if (reaction?.emoji.name === "😄") {
          await this.save(parsedSettings, message, name, value);

          return message.reply(
            `\`${name}\` saved with new value \`${value}\`.`
          );
        }

        return message.reply(`\`${name}\` will not be overwritten.`);
      } catch {
        return message.reply(`\`${name}\` will not be overwritten.`);
      }
    }

    await this.save(parsedSettings, message, name, value);

    return message.reply(
      `Saved \`${value}\` as \`${name}\`. Use ${message.anyUsage(
        "roll $" + name
      )} to roll the saved dice.`
    );
  }

  private async save(
    parsedSettings: RollSettings,
    message: CommandoMessage,
    name: string,
    value: string
  ) {
    parsedSettings[message.author.id] = {
      ...parsedSettings[message.author.id],
      [name]: value,
    };

    await this.client.provider.set(
      message.guild,
      "rolls",
      JSON.stringify(parsedSettings)
    );
  }
}
