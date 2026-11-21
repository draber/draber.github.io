/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
// first, so the diagnostics know when the code started to run
import "./utils/timing.js";
import App from "./modules/app.js";
import nyt from "./nyt/nyt.js";
import outageNotice from "./widgets/outageNotice.js";
import browserNotice from "./widgets/browserNotice.js";
import diagnostics from "./modules/diagnostics.js";

// Diagnostics, available as soon as the code runs and independent of the app:
// the cases that need them are those in which the app doesn't run, or the menu doesn't open.
diagnostics.listen();

const gameWrapper = nyt.getGameWrapper();

if (gameWrapper) {
    new App(gameWrapper);
} else {
    outageNotice.show([`${nyt.selectors.gameWrapper} not found`]);
}

// e.g. Kiwi, which is no longer maintained: the assistant runs, but not all of it works
browserNotice.check();
