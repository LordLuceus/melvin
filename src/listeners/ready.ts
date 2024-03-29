import { Listener, LogLevel } from "@sapphire/framework";
import { ActivityType } from "discord.js";
import { writeLog } from "../util/log";
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
      type: ActivityType.Playing,
      name: `havoc with ${this.container.client.guilds.cache.size} servers.`,
    });

    writeLog(LogLevel.Info, this.name, "Ready to roll!");
  }
}
