/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import data from "../modules/data.js";
import DetailsPane from "./detailsPane.js";

/**
 * Score so far plugin
 *
 * @param {App} app
 * @returns {Plugin} Score
 */
class Score extends DetailsPane {
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

    /**
     * Score constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, {
            title: "Score",
            description: "The number of words and points and how many have been found",
            shortcuts: [
                {
                    combo: "Shift+Alt+X",
                    method: "togglePane",
                },
            ],
            open: true,
        });
    }
}

export default Score;
