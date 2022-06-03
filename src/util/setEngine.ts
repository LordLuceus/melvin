import { NumberGenerator } from "@dice-roller/rpg-dice-roller";
import { container } from "@sapphire/framework";

export const setEngine = () => {
  const { engines, generator } = NumberGenerator;
  generator.engine = engines.nodeCrypto;
  container.logger.info("Random number generator set.");
};
