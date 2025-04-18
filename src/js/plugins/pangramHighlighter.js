/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import { prefix } from "../utils/string.js";
import Plugin from "../modules/plugin.js";
import data from "../modules/data.js";
import fn from "fancy-node";

/**
 * Pangram Highlight plugin
 *
 * @param {App} app
 * @returns {Plugin} PangramHl
 */
class PangramHighlighter extends Plugin {
    /**
     * Toggle state
     * @param state
     * @returns {PangramHighlighter}
     */
    toggle(state) {
        super.toggle(state);
        return this.run();
    }

    /**
     * Add pangram underlines
     * @param {Event} evt
     * @returns {PangramHighlighter}
     */
    // eslint-disable-next-line no-unused-vars
    run(evt) {
        const pangrams = data.getList("pangrams");
        const container = evt?.detail ?? this.app.resultList;

        fn.$$("li", container).forEach((node) => {
            const term = node.textContent;
            if (pangrams.includes(term) || fn.$(".pangram", node)) {
                node.classList.add(this.marker);
            }
        });

        return this;
    }

    /**
     * PangramHl constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "Highlight PangramHl", "", {
            runEvt: prefix("refreshUi"),
        });

        this.marker = prefix("pangram", "d");

        this.app.on(prefix("yesterday"), (evt) => {
            this.run(evt);
        });

        this.run();
    }
}

export default PangramHighlighter;
