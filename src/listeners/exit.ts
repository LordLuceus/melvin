import { Listener, LogLevel } from "@sapphire/framework";
import { writeLog } from "../util/log";

export class ExitListener extends Listener {
  constructor(context: Listener.Context) {
    super(context, {
      emitter: process,
      event: "SIGTERM",
    });
  }

  public async run() {
    writeLog(LogLevel.Info, this.name, "Exiting.");
    await this.container.client.destroy();
    process.exit(0);
  }
}
