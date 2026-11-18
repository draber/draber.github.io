/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import fn from "fancy-node";
import { prefix } from "./string.js";

/**
 * `data-ui` value of SBA's own modal scaffold
 * @type {String}
 */
export const modalHostKey = prefix("modal-host", "d");

/**
 * Selectors for the close buttons of the various pop-up formats
 * @type {String[]}
 */
const closerSelectors = [
    ".pz-moment__frame.on-stage .pz-moment__close",
    ".pz-moment__frame.on-stage .pz-moment__close_text",
    ".sb-modal-close",
];

/**
 * Get the close button of any open pop-up, NYT or SBA
 * @param {App} app
 * @returns {HTMLElement|Boolean}
 */
export const findCloseButton = (app) => {
    for (let selector of closerSelectors) {
        const closer = fn.$(selector, app.gameWrapper);
        if (closer) {
            return closer;
        }
    }
    return false;
};

/**
 * Get the close button of an open NYT pop-up, ignoring SBA's own pop-ups
 * @param {App} app
 * @returns {HTMLElement|Boolean}
 */
export const findNytCloseButton = (app) => {
    for (let selector of closerSelectors) {
        const closer = Array.from(fn.$$(selector, app.gameWrapper)).find(
            (elem) => !elem.closest(`[data-ui="${modalHostKey}"]`),
        );
        if (closer) {
            return closer;
        }
    }
    return false;
};
