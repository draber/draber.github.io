/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import settings from "../modules/settings.js";

/**
 * One assistant per page, the first one wins.
 *
 * Extension and bookmarklet, or two copies of the extension, each bring their own bundle. Each of them would
 * build a complete assistant, with two progress bars, two sets of listeners and so on. The first one to start marks
 * the page; every later copy sees the mark and doesn't start at all.
 *
 * The mark is an attribute on <html>, not a global variable: copies don't share their variables, but they share
 * the page. It stays until the page is reloaded, also when the first copy gives up because of an outage.
 *
 * Versions before 6.1.0 don't set the mark. They are recognised by what they leave on the page; two complete
 * assistants on one page block each other and can make the page unresponsive.
 */

/**
 * `data-sba-running` on <html>, the version of the copy that runs
 * @returns {String}
 */
const key = () => `${settings.get("prefix")}Running`;

/**
 * Version of the copy that already runs on this page, if any
 * @returns {String|undefined}
 */
const running = () => document.documentElement.dataset[key()];

/**
 * Traces of an assistant from before 6.1.0, which doesn't set the mark
 * @returns {Boolean}
 */
const olderOneRuns = () =>
    !!document.querySelector(
        `[data-id="${settings.get("prefix")}App"], .pz-toolbar-button__${settings.get("prefix")}`,
    ) || typeof document.body?.dataset[`${settings.get("prefix")}Active`] !== "undefined";

/**
 * Claim the page for this copy
 * @returns {Boolean} true if this copy may start, false if another one runs already
 */
const claim = () => {
    const other = running();
    if (typeof other !== "undefined") {
        console.info(
            `${settings.get("label")} ${other} is already running, this copy (${settings.get("version")}) doesn't start.`,
        );
        return false;
    }
    if (olderOneRuns()) {
        console.info(
            `${settings.get("label")}: an older version is already running, this copy (${settings.get("version")}) doesn't start.`,
        );
        return false;
    }
    document.documentElement.dataset[key()] = settings.get("version");
    return true;
};

export default {
    claim,
    running,
};
