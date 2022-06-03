import { NumberGenerator } from "@dice-roller/rpg-dice-roller";
import { LogLevel } from "@sapphire/framework";
import { writeLog } from "./log";

export const setEngine = () => {
  const { engines, generator } = NumberGenerator;
  generator.engine = engines.nodeCrypto;
  writeLog(LogLevel.Debug, "SetEngine", "Random number generator set.");
};
