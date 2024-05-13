import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import type { roll } from "@prisma/client";
import { container } from "@sapphire/pieces";
import { ExtendedDiceRoll } from "./extendedDiceRoll";

interface ProcessedRoll {
  originalNotation: string;
  resultnotation: string;
  hasShortcut: boolean;
}

export interface RollResult {
  roll: ExtendedDiceRoll | ExtendedDiceRoll[];
  hasShortcut: boolean;
}

function processNotation(
  notation: string,
  regex: RegExp,
  savedRolls: roll[]
): ProcessedRoll {
  const result: ProcessedRoll = {
    originalNotation: notation,
    resultnotation: notation,
    hasShortcut: false,
  };
  const rollString = notation.replaceAll(regex, (match) => {
    const foundRoll = savedRolls.find((r) => r.name === match);
    if (foundRoll) {
      result.hasShortcut = true;
      return foundRoll.value;
    }
    return match;
  });
  result.resultnotation = rollString;
  return result;
}

export const rollDice = async (
  notation: string | string[],
  userId: string,
  guildId?: string
): Promise<RollResult> => {
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
    const result = processNotation(notation, regex, savedRolls);
    const diceRoll = diceRoller.roll(result.resultnotation) as DiceRoll;
    return {
      roll: new ExtendedDiceRoll(diceRoll, result.originalNotation),
      hasShortcut: result.hasShortcut,
    };
  }

  const result = notation.map((n) => processNotation(n, regex, savedRolls));

  const rolls = diceRoller.roll(
    ...result.map((r) => r.resultnotation)
  ) as DiceRoll[];
  const results = rolls.map(
    (r, i) => new ExtendedDiceRoll(r, result[i].originalNotation)
  );

  return {
    roll: results,
    hasShortcut: result.some((r) => r.hasShortcut),
  };
};
