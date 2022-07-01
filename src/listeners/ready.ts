import { Listener, LogLevel } from "@sapphire/framework";
import { ActivityTypes } from "discord.js/typings/enums";
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
      type: ActivityTypes.PLAYING,
      // name: `havoc with ${this.container.client.guilds.cache.size} servers.`,
      name: "Reinvite me if I'm not working: https://discord.com/api/oauth2/authorize?client_id=813806889657434173&permissions=0&scope=bot%20applications.commands",
    });
    writeLog(LogLevel.Info, this.name, "Ready to roll!");
  }
}
