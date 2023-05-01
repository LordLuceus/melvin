import type { roll } from "@prisma/client";
import { container } from "@sapphire/pieces";

function processNotation(notation: string, regex: RegExp, savedRolls: roll[]) {
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
  const { prisma, diceRoller } = container;

  const savedRolls = await prisma.roll.findMany({
    where: {
      user: { id: userId },
      guild: { id: guildId },
    },
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
};
