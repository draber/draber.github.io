/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import settings from "../modules/settings.js";
import { prefix } from "./string.js";

/**
 * One assistant per page, the first one wins.
 *
 * Extension and bookmarklet, or two copies of the extension, each bring their own bundle. The first one to start
 * sets `window.sbaRunning`; every later copy sees it and doesn't start at all. All copies run in the page's
 * context (the extension adds its script as a <script> element, like the bookmarklet), so they share `window`.
 * The mark stays until the page is reloaded, also when the first copy gives up because of an outage.
 *
 * Versions before 6.1.0 don't set the mark. When one of them runs already, it's removed the way all versions
 * used to do it (last wins). Two complete assistants on one page must not happen: they block each other and
 * can make the page unresponsive. Kept on purpose, for cached bookmarklets, pinned or local versions.
 */

/**
 * `window.sbaRunning`, the version of the copy that runs
 * @returns {String}
 */
const key = () => `${settings.get("prefix")}Running`;

/**
 * Version of the copy that already runs on this page, if any
 * @returns {String|undefined}
 */
const running = () => window[key()];

/**
 * Remove an assistant from before 6.1.0, which doesn't set the mark: its app element gets the destroy event
 */
const removeOlderOne = () => {
    document.querySelector(`[data-id="${prefix("app")}"]`)?.dispatchEvent(new Event(prefix("destroy")));
};

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
    window[key()] = settings.get("version");
    removeOlderOne();
    return true;
};

export default {
    claim,
    running,
};
