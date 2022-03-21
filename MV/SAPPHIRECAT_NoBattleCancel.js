//=============================================================================
// SAPPHIRECAT_NoBattleCancel.js
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
 * @title No Battle Cancel
 * @author Sapphire Cat
 * @date Feb 24, 2022
 * @filename SAPPHIRECAT_NoBattleCancel.js
 * @plugindesc Prevent canceling after choosing a command in battle.
 *
 * @help This plugin does not provide plugin commands.
 * 
 * Loading this plugin prevents the cancel action on actor menus in battle.
 * This prevents the player from changing an entered command, and from
 * returning to the Fight/Escape (aka party command) menu.
 */

var Imported = Imported || {};

(function() {
	if (Imported.SAPPHIRECAT_NoBattleCancel) {
		return;
	}
	Imported.SAPPHIRECAT_NoBattleCancel = true;

	// Instead of interfering with handler binding somehow, let's
	// lie to the engine about whether a handler is bound.
	Window_ActorCommand.prototype.isCancelEnabled = function () {
		return false;
	}
})();

