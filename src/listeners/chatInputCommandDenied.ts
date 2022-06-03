import { Listener } from "@sapphire/framework";
import type {
  ChatInputCommandDeniedPayload,
  UserError,
} from "@sapphire/framework";

export class ChatInputCommandDeniedListener extends Listener {
  public run(error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
    this.container.logger.info(
      `Command ${interaction.command?.name} was denied with message: ${error.message}.`
    );
    return interaction.reply(error.message);
  }
}
