/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import fn from "fancy-node";

/**
 * Delete the last letter if it's created as a side effect of a shortcut
 */
export const deleteLastLetter = () => {
    const el = fn.$(".hive-action__delete");
    if (!el) return;

    el.classList.add("sba-no-feedback");
    const evtOpts = { bubbles: true, cancelable: true };

    el.dispatchEvent(new Event("touchstart", evtOpts));
    setTimeout(() => {
        el.dispatchEvent(new Event("touchend", evtOpts));
        el.classList.remove("sba-no-feedback");
    }, 50);
};

