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
      return message.reply(
        `The setting ${name} already exists. Use a different name, Steve!`
      );
    }

    parsedSettings[message.author.id] = {
      ...parsedSettings[message.author.id],
      [name]: value,
    };

    await this.client.provider.set(
      message.guild,
      "rolls",
      JSON.stringify(parsedSettings)
    );

    return message.reply(
      `Saved ${value} as ${name}. Use ${
        message.guild.commandPrefix || this.client.commandPrefix
      }roll \$${name} to roll the saved dice.`
    );
  }
}
