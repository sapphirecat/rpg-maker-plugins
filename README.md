# rpg-maker-plugins
RPG Maker MV plugins/scripts by sapphirecat

## Download Files
### All Files

Look for the "Code" button just above the directory of files.
Click it.  It opens a menu.  Use the "Download Zip" item at the bottom.
You will now have all files in `rpg-maker-plugin-main.zip` file.
Unzip this file and copy to your project (js/plugins/ folder for JS files.)

### Single File
Follow the link to the file.  Find and click the "Raw" button.
Then right-click and "Save As" or use File menu - Save As.
If the file is `.js` type, please be sure to name it correctly!

## Files

### [MV/inn-script.txt](MV/inn-script.txt)
Replicates the Inn behavior of a popular 8-bit NES RPG.
Characters are fully restored in health and magic.
However, **states are not changed!**  Characters with a Knockout state are not healed.
(This is compatible with the `HIME_CustomDeathStates` plugin.)

To use:

- Copy the lines of the `inn-script.txt` file.
- Create a common event.
- Add a Script.
- Paste the lines of the file as the text of the script.
- Call the common event instead of e.g. "Recover All" during Inn processing.

A further discussion of the code itself is written in
[MV/inn-script-explained.md](MV/inn-script-explained.md),
should you wish to adapt it to your needs.

### [MV/SAPPHIRECAT\_ActionCancel.js](MV/SAPPHIRECAT_ActionCancel.js)
Allows canceling a state-specific skill if the state is lifted.
Ideal for use with Bobstah's [Battle Commands plugin](https://forums.rpgmakerweb.com/index.php?threads/bobstahs-battle-commands-customization-v2-2-1-updated-05-17-2017.46510/).
Normally, if a state is removed between the command setup and the action,
a command available only in the state will still be carried out.
Using this plugin, it can be replaced with Attack.
The skill must have a NoteTag such as:

    <requiredStates:12,13>

This will make the skill available only if the actor has states 12 or 13.
If the actor loses all of these states before using the skill, they will use
Attack instead.  Of course, a single state is also possible:

    <requiredStates:12>

The format is very precise for this plugin.  Do not change case or add spaces.

### [MV/SAPPHIRECAT\_EncounterRates.js](MV/SAPPHIRECAT_EncounterRates.js)
Allows changing the encounter rates on maps via a NoteTag,
based on switches and/or the party's minimum level.  For instance:

    <Encounter Rates L20=0.0 S4=2.0>

If all members of the party are level 20, there will be no encounters.
Otherwise, if switch 4 is ON, then there will be double encounters.
If neither condition applies, the encounter rate is normal.
These modifications stack with the Encounter Half and Encounter None party abilities.

### [MV/SAPPHIRECAT\_NoBattleCancel.js](MV/SAPPHIRECAT_NoBattleCancel.js)
Prevents canceling from the actor command menus during a battle.
Once a command has been fully chosen for a character, there is no backing up.
Consequently, this also prevents returning to the party command menu (Fight/Escape.)

## MV Only

The plugins are created and tested on RPG Maker MV only.
I do not have the newer version.

## License

These files are distributed under the Apache 2.0 license,
for use in free and commercial games.
You may use and modify these files as you see fit.
