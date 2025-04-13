/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import TablePane from "./tablePane.js";
import fn from "fancy-node";
import { prefix } from "../utils/string.js";
import { getProgressBar } from "../utils/ui.js";
import data from "../modules/data.js";

/**
 * SummaryTable plugin
 *
 * @param {App} app
 * @returns {Plugin} SummaryTable
 */
class SummaryTable extends TablePane {
    /**
     * Update table and mark completed cells
     * @param evt
     * @returns {SummaryTable}
     */
    run(evt) {
        super.run(evt);

        const achievements = data.getFoundAndTotal(this.fieldName);
        const tFoot = fn.tfoot({
            content: [
                fn.tr({
                    content: [
                        fn.td({
                            attributes: {
                                colSpan: fn.$("thead tr", this.getPane()).children.length,
                            },
                            classNames: [prefix("progress-box", "d")],
                            content: getProgressBar(achievements.found, achievements.total),
                        }),
                    ],
                }),
            ],
        });
        this.getPane().append(tFoot);
        return this;
    }

    /**
     * Get tabular summary data for a field (✓, ?, ∑).
     * @returns {Array[]} A 2D array representing the table body.
     */
    getData() {
        const achievements = data.getFoundAndTotal(this.fieldName);
        return [
            ["✓", "?", "∑"],
            [achievements.found, achievements.total - achievements.found, achievements.total],
        ];
    }

    /**
     * SummaryTable constructor
     * @param {App} app
     */
    constructor(
        app,
        title,
        description,
        fieldName,
        {
            cssMarkers = {},
            hasHeadRow = true,
            hasHeadCol = true,
            classNames = [],
            events = {},
            caption = "",
        } = {}
    ) {
        super(app, title, description, {
            cssMarkers,
            hasHeadRow,
            hasHeadCol,
            classNames,
            events,
            caption,
        });
        this.fieldName = fieldName;
    }
}

export default SummaryTable;
