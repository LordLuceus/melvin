import { Listener } from "@sapphire/framework";
import { ActivityTypes } from "discord.js/typings/enums";

export class GuildDeleteListener extends Listener {
  public run() {
    this.container.client.user?.setActivity({
      type: ActivityTypes.PLAYING,
      name: `${this.container.client.guilds.cache.size}`,
    });
  }
}
