import { container } from "@sapphire/pieces";
import { Guild } from "../entities/Guild";
import { Roll } from "../entities/Roll";
import { User } from "../entities/User";

function processNotation(notation: string, regex: RegExp, savedRolls: Roll[]) {
  const rollString = notation.replaceAll(regex, (match) => {
    const foundRoll = savedRolls.find((r) => r.name === match);
    if (foundRoll) {
      return foundRoll.value;
    }
    return match;
  });
  return rollString;
}

export const rollDice = async (
  notation: string | string[],
  userId: string,
  guildId?: string
) => {
  const { manager } = container.database;
  const { diceRoller } = container;

  const savedGuild = await manager.findOneBy(Guild, { id: guildId });
  const savedUser = await manager.findOneBy(User, { id: userId });

  if (savedGuild && savedUser) {
    const savedRolls = await manager.find(Roll, {
      where: { guild: savedGuild, user: savedUser },
    });
    const rollNames = savedRolls.map((r) => r.name);
    const regex = new RegExp(rollNames.join("|"), "g");

    if (!Array.isArray(notation)) {
      const processedNotation = processNotation(notation, regex, savedRolls);
      return diceRoller.roll(processedNotation);
    }
    const processedNotations = notation.map((n) =>
      processNotation(n, regex, savedRolls)
    );
    return diceRoller.roll(...processedNotations);
  }

  const roll = Array.isArray(notation)
    ? diceRoller.roll(...notation)
    : diceRoller.roll(notation);
  return roll;
};
