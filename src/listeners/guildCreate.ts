import { Listener, LogLevel } from "@sapphire/framework";
import type { Guild } from "discord.js";
import { ActivityTypes } from "discord.js/typings/enums";
import { writeLog } from "../util/log";

export class GuildCreateListener extends Listener {
  public run(guild: Guild) {
    this.container.client.user?.setActivity({
      type: ActivityTypes.PLAYING,
      // name: `havoc with ${this.container.client.guilds.cache.size} servers.`,
      name: "Reinvite me if I'm not working: https://discord.com/api/oauth2/authorize?client_id=813806889657434173&permissions=0&scope=bot%20applications.commands",
    });
    writeLog(
      LogLevel.Info,
      this.name,
      `Joined guild ${guild.name} with ${guild.memberCount}`
    );
  }
}
