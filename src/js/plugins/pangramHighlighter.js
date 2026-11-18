/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import { prefix } from "../utils/string.js";
import Plugin from "../modules/plugin.js";
import data from "../modules/data.js";
import nyt from "../nyt/nyt.js";
import fn from "fancy-node";

/**
 * Pangram Highlighter plugin
 *
 * Marks pangrams in the result list and in Yesterday's Answers
 *
 * @param {App} app
 * @returns {Plugin} PangramHighlighter
 */
class PangramHighlighter extends Plugin {
    /**
     * Add pangram underlines
     * @param {Event|CustomEvent} [evt] a `yesterday` event carries the modal in `detail`, otherwise the result list is used
     * @returns {PangramHighlighter}
     */
    run(evt) {
        const pangrams = data.getList("pangrams");
        const container = evt?.detail ?? this.app.resultList;

        fn.$$("li", container).forEach((node) => {
            if (pangrams.includes(nyt.getTermFromListItem(node)) || nyt.isMarkedAsPangram(node)) {
                node.classList.add(this.marker);
            }
        });

        return this;
    }

    /**
     * PangramHighlighter constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "Pangram Highlighter", "Marks pangrams in the word lists", {
            key: "pangramHighlighter",
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
