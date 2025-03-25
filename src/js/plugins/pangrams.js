/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import data from "../modules/data.js";
import DetailsPane from "./detailsPane.js";

/**
 * Pangrams plugin
 *
 * @param {App} app
 * @returns {Plugin} Pangrams
 */
class Pangrams extends DetailsPane {
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

    /**
     * Pangrams constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, {
            title: "Pangrams",
            description: "The number of pangrams",
            cssMarkers: {
                completed: (rowData, i) => rowData[1] === 0,
            },
            hasHeadCol: false,
            shortcuts: [
                {
                    combo: "Shift+Alt+P",
                    method: "togglePane",
                },
            ],
        });
    }
}

export default Pangrams;
