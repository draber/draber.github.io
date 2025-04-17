/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import StartSequence from "./startSequence.js";

export default class FirstTwoLetters extends StartSequence {

    constructor(app) {
        super(app, "First two letters", "The number of words by the first two letters", {
            shortcuts: [
                {
                    combo: "Shift+Alt+2",
                    method: "togglePane",
                },
            ],
            letterCnt: 2
        });
    }
}

