# rpg-maker-plugins
RPG Maker MV plugins/scripts by sapphirecat

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

## License

These files are distributed under the Apache 2.0 license,
for use in free and commercial games.
You may use and modify these files as you see fit.
