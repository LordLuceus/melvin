import { Precondition } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";

export class OwnerOnlyPrecondition extends Precondition {
  public override async chatInputRun(interaction: CommandInteraction) {
    return this.checkOwner(interaction.user.id);
  }

  private async checkOwner(userId: string) {
    return process.env.OWNER_ID === userId
      ? this.ok()
      : this.error({ message: "Only the bot owner can use this command." });
  }
}

declare module "@sapphire/framework" {
  /* eslint no-unused-vars: "off" */
  interface Preconditions {
    OwnerOnly: never;
  }
}
