/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import Plugin from "../modules/plugin.js";
import hive from "../modules/hive.js";
import nyt from "../nyt/nyt.js";
import PopupBuilder from "../widgets/popupBuilder.js";

/**
 * Time to wait for the NYT to process the typed character before deleting it
 * @type {Number}
 */
const deleteDelay = 50;

/**
 * NYT Shortcuts plugin
 *
 * Adds keyboard shortcuts to native NYT pop-ups
 *
 * @param {App} app
 * @returns {Plugin} NytShortcuts
 */
class NytShortcuts extends Plugin {
    /**
     * Open or close Yesterday's Answers
     * @returns {NytShortcuts}
     */
    toggleYesterday() {
        return this.triggerPopup("yesterday");
    }

    /**
     * Open or close the statistics
     * @returns {NytShortcuts}
     */
    toggleStats() {
        return this.triggerPopup("stats");
    }

    /**
     * Toggle a NYT pop-up: close whatever modal is open, otherwise open the requested one.
     *
     * While a NYT modal is open, the character of the shortcut isn't caught by `shortcutRegistry.requiresDeletion()`,
     * it reaches the input field after the modal has closed and is deleted here.
     *
     * @param {String} name key in `nyt.selectors.toolbarButtons`
     * @returns {NytShortcuts}
     *
     * @todo Replace the delay with an event-driven solution
     */
    triggerPopup(name) {
        if (nyt.closeModal()) {
            setTimeout(hive.deleteLetter, deleteDelay);
        } else if (!PopupBuilder.closeAll()) {
            nyt.clickToolbarButton(name);
        }
        return this;
    }

    /**
     * NytShortcuts constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "NYT Shortcuts", "Adds keyboard shortcuts to native NYT pop-ups", { key: "nytShortcuts" });

        this.shortcuts = [
            { combo: "Shift+Alt+Y", method: "toggleYesterday", label: "Yesterday’s Answers" },
            { combo: "Shift+Alt+I", method: "toggleStats", label: "Statistics" },
        ].map((shortcut) => ({ ...shortcut, origin: "nyt" }));
    }
}

export default NytShortcuts;
