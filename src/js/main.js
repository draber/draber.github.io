/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import App from "./modules/app.js";
import nyt from "./nyt/nyt.js";
import outageNotice from "./widgets/outageNotice.js";

const gameWrapper = nyt.getGameWrapper();

if (gameWrapper) {
    new App(gameWrapper);
} else {
    outageNotice.show([`${nyt.selectors.gameWrapper} not found`]);
}
