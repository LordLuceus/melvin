import { Listener, LogLevel } from "@sapphire/framework";
import { writeLog } from "../util";

export class ExitListener extends Listener {
  constructor(context: Listener.LoaderContext) {
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
