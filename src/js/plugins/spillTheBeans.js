/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import data from "../modules/data.js";
import {prefix} from "../utils/string.js";
import Plugin from "../modules/plugin.js";
import fn from "fancy-node";

/**
 * Spill the beans plugin
 *
 * @param {App} app
 * @returns {Plugin} SpillTheBeans
 */
class SpillTheBeans extends Plugin {
    /**
     * Check if the input matches a term in the remainder list
     * @param evt
     */
    run(evt) {
        let partial = evt.detail?.textContent?.trim() || '';
        let emoji = "🙂";
        if (!partial) {
            emoji = "😐";
        } else if (!data.getList("remainders").filter((term) => term.startsWith(partial)).length) {
            emoji = "🙁";
        }
        this.ui.textContent = emoji;
        return this;
    }

    /**
     * True if the widget is active, false otherwise
     * @returns {Boolean}
     */
    getState() {
        return !this.ui.classList.contains('inactive')
    }

    /**
     * Toggle the display of the widget
     * @returns {Plugin} SpillTheBeans
     */
    toggle() {
        this.ui.classList.toggle('inactive', this.getState());
        return this;
    }

    /**
     * SpillTheBeans constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "Spill the beans", "An emoji that shows if the last letter was right or wrong", {
            runEvt: prefix("newInput"),
            addMethod: "prepend",
        });

        this.menu = {
            action: "boolean",
        };

        /**
         * Emoji area
         */
        this.ui = fn.div({
            content: "😐",
            classNames: ['inactive']
        });

        this.target = fn.$(".sb-controls", this.app.gameWrapper);

        this.shortcuts = [
            {
                combo: "Shift+Alt+E",
                method: 'toggle',
            },
        ];
    }
}

export default SpillTheBeans;
