import { Listener, LogLevel } from "@sapphire/framework";
import { DMChannel, GuildChannel } from "discord.js";
import { writeLog } from "../util";

export class ChannelDeleteListener extends Listener {
  public async run(channel: GuildChannel | DMChannel) {
    const { guild } = this.container.prisma;

    writeLog(LogLevel.Info, this.name, `Channel ${channel.id} was deleted`);

    if (channel instanceof DMChannel) return;

    const savedGuild = await guild.findUnique({
      where: { id: channel.guild.id },
    });

    if (savedGuild?.gmChannel === channel.id) {
      await guild.update({
        where: { id: channel.guild.id },
        data: { gmChannel: null },
      });
    }
  }
}
