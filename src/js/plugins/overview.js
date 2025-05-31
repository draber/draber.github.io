/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import data from "../modules/data.js";
import {buildStandardTable} from '../widgets/tableBuilder.js'
import {prefix} from "../utils/string.js";
import DetailsBuilder from "../widgets/detailsBuilder.js";
import Plugin from "../modules/plugin.js";

/**
 * Overview so far plugin
 *
 * @param {App} app
 * @returns {Plugin} Overview
 */
export default class Overview extends Plugin {
    togglePane() {
        return this.detailsBuilder.togglePane();
    }

    run(evt) {
        this.detailsBuilder.update(this.createTable());
        return this;
    }

    /**
     * Build table data set
     * @returns {Array}
     */
    getData() {
        const keys = ["foundTerms", "remainders", "answers"];
        return [
            ["", "✓", "?", "∑"],
            ["W"].concat(keys.map((key) => data.getCount(key))),
            ["P"].concat(keys.map((key) => data.getPoints(key))),
        ];
    }

    createTable() {
        return buildStandardTable(this.getData());
    }

    /**
     * Overview constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "Overview", "The number of words and points and how many have been found", {
            runEvt: prefix("refreshUi")
        });

        this.detailsBuilder = new DetailsBuilder(this.title, true);
        this.ui = this.detailsBuilder.ui;

        this.shortcuts = [
            {
                combo: "Shift+Alt+O",
                method: "togglePane",
            },
        ]
    }
}