/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import Plugin from "../modules/plugin.js";
import { prefix } from "../utils/string.js";
import DetailsBuilder from "../widgets/detailsBuilder.js";
import  TableBuilder from "../widgets/tableBuilder.js";
import data from "../modules/data.js";

export default class Pangrams extends Plugin {
    togglePane() {
        return this.detailsBuilder.togglePane();
    }

    run(evt) {
        this.detailsBuilder.update(this.createTable());
        return this;
    }

    /**
     * Get the data for the table cells
     * @returns {Array}
     */
    getData() {
        const pangramCount = data.getCount("pangrams");
        const foundPangramCount = data.getCount("foundPangrams");
        return [
            ["✓", "?", "∑"],
            [foundPangramCount, pangramCount - foundPangramCount, pangramCount],
        ];
    }

    createTable() {
        return (new TableBuilder(this.getData(), {
            hasHeadRow: true,
            hasHeadCol: false,
            classNames: ["data-pane", "th-upper", "table-full-width", "equal-cols", "small-txt"]
                .map((name) => prefix(name, "d"))
                .concat(["pane"]),
            rowCallbacks: [
                (rowData, rowIdx, rowObj) => {
                    if (rowData[2] === 0) {
                        rowObj.classNames.push(prefix("completed", "d"));
                    }
                },
            ],
        })).ui;
    }

    /**
     * Pangrams constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "Pangrams", "The number of pangrams", { runEvt: prefix("refreshUi") });

        this.detailsBuilder = new DetailsBuilder(this.title, false);
        this.ui = this.detailsBuilder.ui;

        this.shortcuts = [
            {
                combo: "Shift+Alt+P",
                method: "togglePane",
            },
        ];
    }
}
