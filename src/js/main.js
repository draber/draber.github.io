/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import App from "./modules/app.js";
import nyt from "./nyt/nyt.js";
import settings from "./modules/settings.js";

const gameWrapper = nyt.getGameWrapper();

if (gameWrapper) {
    new App(gameWrapper);
} else {
    console.warn(`${settings.get("label")}: ${nyt.selectors.gameWrapper} not found, the NYT page has changed.`);
}
