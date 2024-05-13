# Melvin

**An advanced RPG dice bot for Discord**

## [Invite Melvin to your server](https://discord.com/api/oauth2/authorize?client_id=813806889657434173&permissions=0&scope=bot%20applications.commands)

### Usage

`roll` is the main dice rolling command. The dice parser is very advanced and supports many different types of dice notation. Here are some examples of what you can do:

- `/roll d20` - The standard die roll. You can roll up to 999 dice with any number of sides.
- `/roll 4d8+5` - Roll dice with a modifier.
- `/roll 2d20kh1+13` - Roll and keep the highest result (D&D 5e advantage).
- `/roll 2d20dl1+13` - Roll and drop the lowest result - effectively the same as above.
- `/roll 2d20kl1+13` - Roll and keep the lowest result (5e disadvantage).
- `/roll 2d20dh1+13` - Roll and drop the highest - again, same as above.
- `/roll 1d10!` - Exploding dice.
- `/roll 1d10!!` - Compounding dice (explode and add the rolls together).
- `/roll 8d6min2` - Roll and treat anything below a 2 as a 2 (5e Elemental Adept feat).
- `/roll 4d10max6` - Treat anything above a 6 as a 6.
- `/roll d20r+7` - Reroll on a 1, keep rerolling until the result isn't a 1.
- `/roll d20ro+7` - Reroll only once, even if the second roll is also a 1 (lucky halflings).
- `/roll d20r<10` - Reroll on anything less than a 10.
- `/roll 4d6>=4` - A 4 and above is a success.
- `/roll 4d6=5` - Can you roll exactly a 5?
- `/roll 4dF` - Fudge/fate dice.
- `/roll (14+6)*17` - Do maths.
- `/roll 8d8*2` - Do maths with dice.
- `/roll floor(8d6/2)` - Devils are resistent to fire - half damage rounded down.

Note that the modifiers which affect the dice rolls themselves (min, max, k etc) must come before any numerical modifiers (+4). So: `/roll 2d20kh1+9` is valid, but `/roll 2d20+9kh1` is not.

The roll command has several options that you can make use of. The first of these is the repeat option. For example, to use this option to roll 4d6kh3 six times (D&D stat generation), do the following:

1. Type `/roll`.
2. Type in the dice you wish to roll: `4d6kh3`.
3. Hit down arrow and choose the repeat option.
4. Type in the amount of times you wish to roll these dice: `6`.
5. Hit enter. The output should look as follows:

```
4d6kh3: [3, 5, 1d, 4] = 12
4d6kh3: [1d, 4, 4, 6] = 14
4d6kh3: [5, 4, 1d, 3] = 12
4d6kh3: [4, 6, 3d, 5] = 15
4d6kh3: [1d, 1, 2, 6] = 9
4d6kh3: [5d, 5, 5, 6] = 16
```

Note that the repeat option supports up to a maximum of ten repetitions.

The output option allows you to output information about the dice you have specified. It can output the minimum, maximum, or the average roll that is possible with those dice.

With the secret option, you can make the result of the roll only visible to the game master, useful for Pathfinder 2e secret rolls or other similar situations. The GM channel must be set to use the secret option. You can set the GM channel using the `/gm` command. You may only use the GM command if you have the `Manage Server` permission.

### Roll Shortcuts

You can also save rolls that you use often to allow you to reroll them quickly. These roll shortcuts are tied both to you and the server. This means that you can have the same shortcut on multiple servers and have them all be different rolls. The `shortcut` command is used to interact with roll shortcuts.

To do this, type `/shortcut add`, press enter, enter the name, e.g. fireball, press enter, type in the roll, e.g. 6d6, and hit enter.

To roll it, simply type `/roll fireball`.

If you try to save a shortcut that already exists, you will be asked if you want to overwrite it.

The power of roll shortcuts is that you can include more than one in a single roll, and even combine them with normal dice notations. For example, you can do something like this: `/roll adv+atk+5`. Let's break that down:

- `adv`: expands to `2d20kh1`, D&D 5e advantage.
- `atk`: expands to your attack modifier.

So, when your attack modifier changes, you can simply update the `atk` shortcut and use it like before.

The `shortcut list` and `shortcut remove` commands allow you to interact with your roll shortcuts. The `list` command lists all saved rolls and the `remove` command clears the specified shortcut, or all of them if not specified.

#### Roll Groups

What if you have a group of rolls that you often want to roll together? Enter the `group` command. This command builds on roll shortcuts by allowing you to group multiple rolls together. The `group` command is used to interact with roll groups.

To create a new group, type `/group create`, press enter, enter the name, e.g. `perception checks`, and hit enter.

To add a roll to the group, type `/group add`, press enter, enter the name of the group, e.g. `perception checks`, press enter, and type in the shortcut, e.g. `luceus-perception`. You can add as many rolls as you like to a group. If the group does not exist, it will be created, but the shortcut must already exist.

To remove a roll from a group, type `/group remove`, press enter, enter the name of the group, e.g. `perception checks`, press enter, and type in the shortcut, e.g. `luceus-perception`.

To view a group, type `/group view`, press enter, enter the name of the group, e.g. `perception checks`, and hit enter. This will display all the rolls in the group, similar to the `shortcut list` command.

To list all groups, type `/group list`, and hit enter. This will display all the groups you have created and the number of rolls in each group.

To delete a group, type `/group delete`, press enter, enter the name of the group, e.g. `perception checks`, and hit enter.

You can roll a group by simply typing `/roll <group-name>`. This will roll all the rolls in the group and display the results. Note that, if you wish to roll a group, the group name must be the only thing in the input, otherwise the roll will fail.

### Support

If you have any questions, feedback, or just want to chat, get in touch on Discord. I'm LordLuceus#7492.

If you like Melvin and want to support future development, you could [buy me a coffee ☕](https://paypal.me/luceusproductions). Thanks!
