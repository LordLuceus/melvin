import { Listener } from "@sapphire/framework";
import { ActivityTypes } from "discord.js/typings/enums";
import { setEngine } from "../util/setEngine";

export class ReadyListener extends Listener {
  public constructor(context: Listener.Context) {
    super(context, {
      once: true,
    });
  }

  public run() {
    setEngine();
    this.container.client.user?.setActivity({
      type: ActivityTypes.PLAYING,
      name: `Dice in ${this.container.client.guilds.cache.size} servers.`,
    });
    this.container.logger.info("Ready to roll!");
  }
}
