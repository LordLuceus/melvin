import "@sapphire/plugin-logger/register";
import * as dotenv from "dotenv";
import { MelvinClient } from "./client/MelvinClient";

dotenv.config();

const melvin = new MelvinClient();

melvin.login(process.env.DISCORD_TOKEN || "");
