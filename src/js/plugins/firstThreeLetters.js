/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import StartSequence from "./startSequence.js";

export default class FirstThreeLetters extends StartSequence {

    constructor(app) {
        super(app, "First three letters", "The number of words by the first three letters", {
            shortcuts: [
                {
                    combo: "Shift+Alt+3",
                    method: "togglePane",
                },
            ],
            letterCnt: 3
        });
    }
}

