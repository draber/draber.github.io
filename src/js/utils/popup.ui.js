/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import fn from "fancy-node";

/**
 * Get the close button of the various pop-up formats
 * @returns {HTMLElement|Boolean}
 */
export const findCloseButton = (app) => {
    for (let selector of [
        ".pz-moment__frame.on-stage .pz-moment__close",
        ".pz-moment__frame.on-stage .pz-moment__close_text",
        ".sb-modal-close",
    ]) {
        const closer = fn.$(selector, app.gameWrapper);
        if (closer) {
            return closer;
        }
    }
    return false;
};