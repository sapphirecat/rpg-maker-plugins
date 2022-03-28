//=============================================================================
// SAPPHIRECAT_EncounterRates.js
//=============================================================================
//
// Copyright 2022 Sapphire Cat <devel@sapphirepaw.org>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/*:
 * @title Encounter Rates
 * @author Sapphire Cat
 * @date Mar 24, 2022
 * @filename SAPPHIRECAT_EncounterRates.js
 * @plugindesc Change random encounter rates by switches or party levels.
 *
 * @help Place a NoteTag in the Map, similar to the following:
 *
 * <Encounter Rates L15=0.5>
 * <Encounter Rates L10=0.0 L8=0.6 S3=0.3>
 *
 * The first example simply halves the encounter rate (0.5x = 50%) when the
 * lowest level character in the party is level 15 or above.  Any rate below
 * 0 will be treated as 0 (no encounters.)  Rates above 1.0 allow for more
 * encounters than normal.
 *
 * The second example provides multiple parameters: it will turn off
 * encounters entirely if the lowest level character in the party is level 10
 * or higher, or reduce the encounter rate to 60% (0.6x) if the level is 8 or
 * 9.  If Switch #0003 is ON, then the encounter rate is 30% of what it would
 * otherwise be: 30% (level 1-7 character), 18% (level 8-9), or none.
 *
 * This plugin will stack with the "Encounters Half" party ability, so the
 * second example could also be 15%/9%/0% encounter rates, combining all the
 * effects of levels, Encounters Half, and Switch #0003.
 *
 * This plugin does not provide plugin commands.
 */

var Imported = Imported || {};

(function () {
    "use strict";

    if (Imported.SAPPHIRECAT_EncounterRates) {
        return;
    }
    Imported.SAPPHIRECAT_EncounterRates = true;

    // key: mapId
    // value: object
    // - key: switches
    //   value: object
    //   - key: switchId int[1..INF]
    //   - value: switchRate float[0.0..INF]
    // - key: levels
    //   value: array; sorted by decreasing minLevel
    //   - items: array
    //     - index 0: level int[1..INF]
    //     - index 1: levelRate float[0.0..INF]
    const mapRates = {},
        noNotesMaps = {},
        detectRegex = /<encounter[-_ ]rates\s+([^>]+)>/i,
        parseRegex = /([ls])(\d+)=([\d.]+)/gi,
        isLevelRegex = /^[Ll]$/;
    let curRate = 1.0,
        loadedMaps = 0;

    // --- PARSE TAGS FROM MAPS ---
    function parseRate(s) {
        const f = parseFloat(s)

        if (isNaN(f)) {
            return 1.0;
        } else if (f < 0) {
            return 0.0;
        }

        return f;
    }

    function _getEntries(mapNote) {
        const entries = [],
            mm = mapNote.match(detectRegex);

        if (!mm) {
            return entries;
        }

        let m;
        while ((m = parseRegex.exec(mm[1])) !== null) {
            entries.push(m);
        }

        return entries;
    }

    function parseMapTags(mapId) {
        const mapNote = $dataMap.note,
            mapRate = {switches:{}, levels:[]},
            levelTmp = {};
        let valid = false;

        const entries = _getEntries(mapNote);
        if (!entries) {
            noNotesMaps[mapId] = true;
            return null;
        }

        for (const m of entries) {
            if (m.length < 4) {
                continue;
            }
            const rate = parseRate(m[3]);
            const id = parseInt(m[2], 10);

            if (isNaN(id) || id <= 0) {
                continue;
            }

            valid = true;
            if (isLevelRegex.test(m[1])) {
                // deduplicate levels: last one wins
                levelTmp[id] = rate;
            } else {
                // must be a switch: only store valid switch IDs
                if (id > 0 && id < $dataSystem.switches.length) {
                    mapRate.switches[id] = rate;
                }
            }
        }

        if (!valid) {
            noNotesMaps[mapId] = true;
            return null;
        }

        // this is already the format I wanted to have. lucky!
        mapRate.levels = Object.entries(levelTmp);
        if (mapRate.levels.length) {
            // sort it by highest->lowest level data, for fast processing
            mapRate.levels.sort((a, b) => b[0] - a[0])
        }

        // balance memory and CPU: reset the cache if it gets too big
        if (++loadedMaps > 50) {
            mapRates = {};
            loadedMaps = 1;
        }

        return mapRates[mapId] = mapRate;
    }

    // --- UPDATE ACTIVE VARS ---
    function getCurRate(tagData) {
        let r = 1.0;

        if (!tagData.hasOwnProperty('levels')) {
            return r;
        }

        // get any switch rates that apply
        for (const id of Object.keys(tagData.switches)) {
            if ($gameSwitches.value(id)) {
                r *= tagData.switches[id];
            }
        }

        // check for levels
        if (tagData.levels.length) {
            let minLv;

            // get the party's minimum level
            for (const a of $gameParty.members()) {
                if (!minLv || a.level < minLv) {
                    minLv = a.level;
                }
            }

            // determine the levelRate from minLv and the map data
            for (const entry of tagData.levels) {
                if (minLv >= entry[0]) {
                    return r * entry[1];
                }
            }
        }

        return r;
    }

    function getMapRate(mapId) {
        const r = mapRates[mapId] || parseMapTags(mapId);

        return r ? getCurRate(r) : 1.0;
    }

    function updateCurrentMap(mapId) {
        if (mapId <= 0 || noNotesMaps[mapId]) {
            curRate = 1.0;
            return;
        }

        try {
            curRate = getMapRate(mapId);
        } catch (e) {
            curRate = 1.0; // reset to standard
            console.error(e);
        }
    }

    // --- CONTROL THE ACTIVE VARS BASED ON GAME EVENTS ---
    const parent_mapSetup = Game_Map.prototype.setup; // (mapId) -> void
    const parent_switchSet = Game_Switches.prototype.setValue; // (switchId, value) -> void
    const parent_actorExp = Game_Actor.prototype.changeExp; // (exp, show) -> void

    // Update the encounter rate whenever we load a new map
    Game_Map.prototype.setup = function(mapId) {
        parent_mapSetup.call(this, mapId);
        updateCurrentMap(mapId);
    };

    // Update the encounter rate whenever any switch is modified
    Game_Switches.prototype.setValue = function (switchId, value) {
        parent_switchSet.call(this, switchId, value);
        updateCurrentMap($gameMap.mapId());
    }

    // Update the encounter rate whenever character levels change
    Game_Actor.prototype.changeExp = function (exp, show) {
        const lv = this.level;
        parent_actorExp.call(this, exp, show);

        if (lv != this.level) {
            updateCurrentMap($gameMap.mapId());
        }
    }

    // --- CONTROL THE ENCOUNTER RATE BASED ON ACTIVE VARS ---
    const parent_canEncounter = Game_Player.prototype.canEncounter; // () -> bool
    const parent_encounterProgressValue = Game_Player.prototype.encounterProgressValue; // () -> float

    Game_Player.prototype.canEncounter = function() {
        return curRate > 0.0 && parent_canEncounter.call(this);
    };

    Game_Player.prototype.encounterProgressValue = function() {
        return curRate * parent_encounterProgressValue.call(this);
    };
})();
