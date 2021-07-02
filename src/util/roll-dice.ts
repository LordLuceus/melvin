import { CommandoClient, CommandoMessage } from "discord.js-commando";
import { DiceRoll } from "rpg-dice-roller";

export const rollDice = (
  dice: string,
  client: CommandoClient,
  msg: CommandoMessage
): DiceRoll => {
  if (dice.startsWith("$")) {
    const name = dice.replace("$", "");

    const savedSettings = client.provider.get(msg.guild, "rolls");
    if (!savedSettings) {
      throw new Error(
        `No settings saved. Try to \`${
          msg.guild.commandPrefix || client.commandPrefix
        }save\` something first.`
      );
    }

    const parsedSettings = JSON.parse(savedSettings);

    if (!parsedSettings[msg.author.id]) {
      throw new Error(
        `You haven't saved any settings yet. Try to \`${
          msg.guild.commandPrefix || client.commandPrefix
        }save\` something first.`
      );
    }

    if (!parsedSettings[msg.author.id][name]) {
      throw new Error("No roll saved with that name.");
    }

    return new DiceRoll(parsedSettings[msg.author.id][name]);
  }

  return new DiceRoll(dice);
};
