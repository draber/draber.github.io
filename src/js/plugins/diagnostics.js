/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import Plugin from "../modules/plugin.js";
import diagnostics from "../modules/diagnostics.js";

/**
 * Menu entry and shortcut to copy the diagnostics, see modules/diagnostics.js
 */
class Diagnostics extends Plugin {
    /**
     * Called by the menu (action "popup") and the shortcut
     * @returns {Diagnostics}
     */
    togglePopup() {
        diagnostics.copy();
        return this;
    }

    /**
     * @param {App} app
     */
    constructor(app) {
        super(app, "Copy diagnostics", "Copies technical details for a bug report to the clipboard. No words of the game, nothing personal.");

        this.menu = {
            action: "popup",
        };

        this.shortcuts = [
            {
                combo: "Shift+Alt+B",
                method: "togglePopup",
            },
        ];
    }
}

export default Diagnostics;
