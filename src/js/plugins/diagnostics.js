/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import Plugin from "../modules/plugin.js";
import diagnostics from "../modules/diagnostics.js";

/**
 * Menu entry "Report a problem": a new GitHub issue with diagnostics, see modules/diagnostics.js.
 * Shift+Alt+B does the same, independent of the app, see diagnostics.listen().
 */
class Diagnostics extends Plugin {
    /**
     * Called by the menu (action "popup")
     * @returns {Diagnostics}
     */
    togglePopup() {
        diagnostics.openIssue();
        return this;
    }

    /**
     * @param {App} app
     */
    constructor(app) {
        super(app, "Report a problem", "Opens a new issue on GitHub with technical details attached. No words of the game, nothing personal.");

        this.menu = {
            action: "popup",
        };
    }
}

export default Diagnostics;
