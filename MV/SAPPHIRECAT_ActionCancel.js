//=============================================================================
// SAPPHIRECAT_ActionCancel.js
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
 * @title Cancel State-Specific Action
 * @author Sapphire Cat
 * @date Mar 27, 2022
 * @filename SAPPHIRECAT_ActionCancel.js
 * @plugindesc v1.0.0 Prevent state-specific action if the state has been removed
 *
 * @param maxIgnoreId
 * @text Max Ignore Skill ID
 * @desc ID of the maximum skill to ignore: skills 1-Max are not affected by the plugin
 * @default 2
 *
 * @help This plugin does not provide plugin commands.
 *
 * A skill marked with <requiredStates:ID,ID,Etc> will check when used that
 * the actor has one of the required states, and changed to Attack (skill 1)
 * otherwise.  Skill 1 is always exempt!
 *
 * By default, Skill 2 (normally Guard) is also exempt, but this can be
 * changed through the parameters.
 */

var Imported = Imported || {};
var SAPPHIRECAT_ActionCancel;

if (!Imported.SAPPHIRECAT_ActionCancel) {
    Imported.SAPPHIRECAT_ActionCancel = true;

    // --- parse parameters ---
    // this is just a convenience for parameter parsing; the global var is
    // used during a battle, so that the params aren't locked up in here.
    const plugin = {
        Parameters: PluginManager.parameters('SAPPHIRECAT_ActionCancel'),
        Param: {},
    };
    SAPPHIRECAT_ActionCancel = plugin;

    const parsePluginInt = function(key, defaultValue, min) {
        const v = Number(plugin.Parameters[key]);
        plugin.Param[key] = isNaN(v) ? defaultValue : Math.max(v, min);
    };

    parsePluginInt('maxIgnoreId', 2, 1);

    // --- check all skills at startup for our tags ---
    let starting = true;
    const requirements = {};
    const parseStateIds = function(text) {
        results = [];

        for (const v of text.split(',')) {
            const id = parseInt(v, 10);
            if (!isNaN(id)) results.push(id);
        }

        return results;
    }

    const parseSkillStates = function() {
        let skill;
        for (let i = 1; i < $dataSkills.length; ++i) {
            skill = $dataSkills[i];
            if (skill.meta && skill.meta.requiredStates) {
                const stateIds = parseStateIds(skill.meta.requiredStates);
                if (stateIds.length) requirements[skill.id] = stateIds;
            }
        }
    }

    // we must wait for items to be loaded, before we can parse them
    const parent_onLoad = DataManager.onLoad;
    DataManager.onLoad = function(object) {
        parent_onLoad.call(this, object);
        if (starting && object === $dataSkills) {
            parseSkillStates();
            starting = false;
        }
    }

    // --- check skill requirements when performing them ---
    const parent_currentAction = Game_Battler.prototype.currentAction;
    Game_Battler.prototype.currentAction = function () {
        const act = parent_currentAction.call(this);
        if (!(act && act.subject && act.item)) {
            return act;
        }
        
        const subject = act.subject(),
            item = act.item();

        // if this isn't actually a skill, just leave
        if (!act.isSkill()) return act;

        // is this a skill we are configured to ignore, or that has no setting?
        const skillId = item.id;
        if ((skillId >= 1 && skillId <= SAPPHIRECAT_ActionCancel.Param.maxIgnoreId) ||
            !requirements[skillId]
        ) {
            return act;
        }

        // test the requirement
        for (const stateId of requirements[skillId]) {
            if (subject.isStateAffected(stateId)) {
                return act; // requirement has been met
            }
        }

        // requirement not met: switch it to the Attack action
        act.setAttack();

        return act;
    }
}
