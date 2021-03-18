# Melvin

**An advanced RPG dice bot for Discord**

## [Invite Melvin to your server](https://discord.com/api/oauth2/authorize?client_id=813806889657434173&permissions=0&scope=bot)

### Usage

You can type `?help` to get a brief overview of the commands. Melvin's default prefix is `?`, but just mentioning him will work as well. You can change the prefix with the `?prefix` command, e.g. `?prefix !`. Issuing this command without any arguments will output the current prefix for your server.

`roll` is the main dice rolling command. The dice parser is very advanced and supports many different types of dice notation. Here are some examples of what you can do:

- `?roll d20` - The standard die roll. You can roll up to 999 dice with any number of sides.
- `?roll 4d8+5` - Roll dice with a modifier.
- `?roll 2d20kh1+13` - Roll and keep the highest result (D&D 5e advantage).
- `?roll 2d20dl1+13` - Roll and drop the lowest result - effectively the same as above.
- `?roll 2d20kl1+13` - Roll and keep the lowest result (5e disadvantage).
- `?roll 2d20dh1+13` - Roll and drop the highest - again, same as above.
- `?roll 1d10!` - Exploding dice.
- `?roll 1d10!!` - Compounding dice (explode and add the rolls together).
- `?roll 8d6min2` - Roll and treat anything below a 2 as a 2 (5e Elemental Adept feat).
- `?roll 4d10max6` - Treat anything above a 6 as a 6.
- `?roll d20r+7` - Reroll on a 1, keep rerolling until the result isn't a 1.
- `?roll d20ro+7` - Reroll only once, even if the second roll is also a 1 (lucky halflings).
- `?roll d20r<10` - Reroll on anything less than a 10.
- `?roll 4d6>=4` - A 4 and above is a success.
- `?roll 4d6=5` - Can you roll exactly a 5?
- `?roll 4dF` - Fudge/fate dice.
- `?roll (14+6)*17` - Do maths.
- `?roll 8d8*2` - Do maths with dice.
- `?roll floor(8d6/2)` - Devils are resistent to fire - half damage rounded down.

Note that the modifiers which affect the dice rolls themselves (min, max, k etc) must come before any numerical modifiers (+4). So: `?roll 2d20kh1+9` is valid, but `?roll 2d20+9kh1` is not.

You can also use the `multiroll` or `rr` command to roll dice multiple times, like this: `?rr 6 4d6kh3`. This will effectively generate a standard set of D&D 5e ability scores.

The `average` or `avg` command will return the average total for the provided dice roll. E.G. `?avg 4d6` will return `14`. Likewise, the `min` and `max` will give you the minimum and maximum totals respectively.

### Support

If you have any questions, feedback, or just want to chat, get in touch on Discord. I'm LordLuceus#7492.

If you like Melvin and want to support future development, you could [buy me a coffee ☕](https://paypal.me/luceusproductions). Thanks!
