import { container, LogLevel } from "@sapphire/framework";

export const writeLog = (level: LogLevel, origin: string, message: string) => {
  container.logger.write(level, `${origin}: ${message}`);
};
