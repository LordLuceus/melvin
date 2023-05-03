import type {
  ChatInputCommandDeniedPayload,
  UserError,
} from "@sapphire/framework";
import { Listener, LogLevel } from "@sapphire/framework";
import { writeLog } from "../util/log";

export class ChatInputCommandDeniedListener extends Listener {
  public run(error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
    writeLog(
      LogLevel.Info,
      interaction.command?.name || "",
      `Command used by ${interaction.user.toString()} denied with message: ${
        error.message
      }`
    );
    return interaction.reply({ content: error.message, ephemeral: true });
  }
}
