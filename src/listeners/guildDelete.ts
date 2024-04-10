import { Listener, LogLevel } from "@sapphire/framework";
import { ActivityType, Guild } from "discord.js";
import { writeLog } from "../util";

export class GuildDeleteListener extends Listener {
  public run(guild: Guild) {
    this.container.client.user?.setActivity({
      type: ActivityType.Playing,
      name: `havoc with ${this.container.client.guilds.cache.size} servers.`,
    });

    writeLog(LogLevel.Info, this.name, `Left guild ${guild.name}`);
  }
}
