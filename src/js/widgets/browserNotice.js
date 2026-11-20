/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import settings from "../modules/settings.js";
import notice from "./notice.js";

/**
 * Notice for browsers in which parts of the assistant don't work, see widgets/notice.js.
 *
 * Kiwi (Android) was discontinued in January 2025. It reports Chrome 132, but lacks many features from
 * Chromium 117 onwards, among them CSS anchor positioning, and the menu doesn't open.
 * Vivaldi for Android runs extensions from the Chrome Web Store and works fine.
 */

/**
 * Kiwi has "Kiwi" in front of "Chrome/" in its user agent
 * @param {String} [userAgent]
 * @returns {Boolean}
 */
const isKiwi = (userAgent = navigator.userAgent) => /\bKiwi\b/.test(userAgent);

/**
 * Show the notice if the browser needs it. The assistant runs anyway, most of it works.
 * Closed, the notice stays away for 30 days.
 * @param {String} [userAgent]
 * @returns {HTMLElement|null} the notice, null if not needed or dismissed
 */
const check = (userAgent = navigator.userAgent) => {
    if (!isKiwi(userAgent)) {
        return null;
    }
    return notice.show({
        key: "kiwi",
        text: "Kiwi Browser is no longer maintained, and parts of the assistant don’t work in it. Vivaldi for Android runs the assistant without problems.",
        links: [{ href: `${settings.get("url")}#mobile-installation`, text: "How to switch" }],
        dismissDays: 30,
    });
};

export default {
    isKiwi,
    check,
};
