/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import data from "../modules/data.js";
import DetailsPane from "./detailsPane.js";

/**
 * LetterCount plugin
 *
 * @param {App} app
 * @returns {Plugin} LetterCount
 */
class LetterCount extends DetailsPane {
    /**
     * Get the data for the table cells
     * @returns {Array}
     */
    getData() {
        const counts = {};
        const cellData = [["", "✓", "?", "∑"]];
        data.getList("answers").forEach((term) => {
            counts[term.length] = counts[term.length] || {
                found: 0,
                missing: 0,
                total: 0,
            };
            if (data.getList("foundTerms").includes(term)) {
                counts[term.length].found++;
            } else {
                counts[term.length].missing++;
            }
            counts[term.length].total++;
        });
        let keys = Object.keys(counts);
        keys.sort((a, b) => a - b);
        keys.forEach((count) => {
            cellData.push([count, counts[count].found, counts[count].missing, counts[count].total]);
        });
        return cellData;
    }

    /**
     * LetterCount constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, {
            title: "Letter count",
            description: "The number of words by length",
            cssMarkers: {
                completed: (rowData, i) => rowData[2] === 0,
            },
            shortcuts: [
                {
                    combo: "Shift+Alt+L",
                    method: "togglePane",
                },
            ]
        });
    }
}

export default LetterCount;
