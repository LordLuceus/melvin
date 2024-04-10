import { Listener, LogLevel } from "@sapphire/framework";
import { ActivityType } from "discord.js";
import { setEngine, writeLog } from "../util";

export class ReadyListener extends Listener {
  public constructor(context: Listener.LoaderContext) {
    super(context, {
      once: true,
    });
  }

  public run() {
    setEngine();
    this.container.client.user?.setActivity({
      type: ActivityType.Playing,
      name: `havoc with ${this.container.client.guilds.cache.size} servers.`,
    });

    writeLog(LogLevel.Info, this.name, "Ready to roll!");
  }
}
