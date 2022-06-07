import "@sapphire/plugin-logger/register";
import "reflect-metadata";
import { token } from "./config/config.json";
import { MelvinClient } from "./util/melvinClient";

const melvin = new MelvinClient();

melvin.login(token);
