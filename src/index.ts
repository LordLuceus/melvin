import "@sapphire/plugin-logger/register";
import "reflect-metadata";
import { MelvinClient } from "./client/MelvinClient";
import { token } from "./config/config.json";

const melvin = new MelvinClient();

melvin.login(token);
