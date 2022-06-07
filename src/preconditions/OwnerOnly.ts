import { Precondition } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";
import { ownerId } from "../config/config.json";

export class OwnerOnlyPrecondition extends Precondition {
  public override async chatInputRun(interaction: CommandInteraction) {
    return this.checkOwner(interaction.user.id);
  }

  private async checkOwner(userId: string) {
    return ownerId === userId
      ? this.ok()
      : this.error({ message: "Only the bot owner can use this command." });
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    OwnerOnly: never;
  }
}
