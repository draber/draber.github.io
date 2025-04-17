/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import StartSequence from "./startSequence.js";

export default class FirstLetter extends StartSequence {

    constructor(app) {
        super(app, "First letter", "The number of words by first letter", {
            shortcuts: [
                {
                    combo: "Shift+Alt+F",
                    method: "togglePane",
                },
            ],
            letterCnt: 1
        });
    }
}

