// import { DiceRoll } from "@dice-roller/rpg-dice-roller";
// import { SapphireClient } from "@sapphire/framework";
// import { Message } from "discord.js";

// export const rollDice = (
//   dice: string,
//   client: SapphireClient,
//   msg: Message
// ): DiceRoll => {
//   if (dice.includes("$")) {
//     const savedSettings = client.provider.get(msg.guild, "rolls");
//     if (!savedSettings) {
//       throw new Error(
//         `No settings saved. Try to \`${
//           msg.guild.commandPrefix || client.commandPrefix
//         }save\` something first.`
//       );
//     }

//     const parsedSettings = JSON.parse(savedSettings);

//     if (!parsedSettings[msg.author.id]) {
//       throw new Error(
//         `You haven't saved any settings yet. Try to \`${
//           msg.guild.commandPrefix || client.commandPrefix
//         }save\` something first.`
//       );
//     }

//     let name: string;
//     let rollString: string;

//     if (dice.startsWith("$")) {
//       if (!dice.includes(" ")) {
//         name = dice.replace("$", "");
//         rollString = parsedSettings[msg.author.id][name];
//       } else {
//         const args = dice.split(" ");
//         name = args[0].replace("$", "");
//         const after = args.slice(1).join("").trim();
//         rollString = parsedSettings[msg.author.id][name] + after;
//       }
//     } else {
//       const before = dice.slice(0, dice.indexOf("$")).trim();
//       name = dice.slice(dice.indexOf("$")).replace("$", "");

//       if (name.includes(" ")) {
//         const after = name.slice(name.indexOf(" ")).trim();
//         name = name.slice(0, name.indexOf(" "));
//         rollString = before + parsedSettings[msg.author.id][name] + after;
//       } else {
//         rollString = before + parsedSettings[msg.author.id][name];
//       }
//     }

//     if (!parsedSettings[msg.author.id][name]) {
//       throw new Error("No roll saved with that name.");
//     }

//     return new DiceRoll(rollString.toLowerCase());
//   }

//   return new DiceRoll(dice.toLowerCase());
// };
