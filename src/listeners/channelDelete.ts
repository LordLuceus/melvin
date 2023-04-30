import { Listener, LogLevel } from "@sapphire/framework";
import { DMChannel, GuildChannel } from "discord.js";
import { Guild } from "../entities/Guild";
import { writeLog } from "../util/log";

export class ChannelDeleteListener extends Listener {
  public async run(channel: GuildChannel | DMChannel) {
    const { manager } = this.container.database;

    writeLog(LogLevel.Info, this.name, `Channel ${channel.id} was deleted`);

    if (channel instanceof DMChannel) return;

    const savedGuild = await manager.findOne(Guild, {
      where: { id: channel?.guild.id },
    });

    if (savedGuild?.gmChannel === channel.id) {
      await manager.update(Guild, savedGuild.id, { gmChannel: "" });
    }
  }
}
