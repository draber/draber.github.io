/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import data from "../modules/data.js";
import { prefix } from "../modules/string.js";
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
        let emoji = "🙂";
        if (!evt.detail) {            
            emoji = "😐";
        } else if (!data.getList("remainders").filter((term) => term.startsWith(evt.detail.textContent.trim())).length) {
            emoji = "🙁";
        }
        this.ui.textContent = emoji;
        return this;
    }

    toggleMode(state) {
        if (state) {
            this.app.domSet("submenu", false);
        }
        if(typeof state === 'undefined') {
            state = !this.getState();
        }
        return this;
    }

    /**
     * SpillTheBeans constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "Spill the beans", "An emoji that shows if the last letter was right or wrong", {
            canChangeState: true,
            runEvt: prefix("newInput"),
            addMethod: "prepend",
        });

        /**
         * Emoji area
         */
        this.ui = fn.div({
            content: "😐",
        });

        this.target = fn.$(".sb-controls", this.app.gameWrapper);

        this.toggleMode(false);

        this.shortcuts = [
            {
                combo: "Shift+Alt+E",
                method: 'toggle',
            },
        ];
    }
}

export default SpillTheBeans;
