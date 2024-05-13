import { DiceRoll } from "@dice-roller/rpg-dice-roller";

export class ExtendedDiceRoll extends DiceRoll {
  public originalNotation: string;

  constructor(diceRoll: DiceRoll, originalNotation: string) {
    super(diceRoll);
    this.originalNotation = originalNotation;
  }
}
