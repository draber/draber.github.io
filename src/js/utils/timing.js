/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

/**
 * Moments of the start, in milliseconds since the page was opened (`performance.now()`), for the diagnostics.
 * main.js imports this first, so `script` is when the assistant's code started to run.
 * @type {Object<String, Number>}
 */
const marks = {
    script: performance.now(),
};

/**
 * Where the code came from, read while it runs for the first time
 * @type {String} extension, bookmarklet, other or unknown
 */
const source = (() => {
    const src = document.currentScript?.src || "";
    if (/^(chrome|moz|safari-web)-extension:/.test(src)) {
        return "extension";
    }
    if (/^https?:/.test(src)) {
        return "bookmarklet";
    }
    return src ? "other" : "unknown";
})();

/**
 * Remember when something happened for the first time
 * @param {String} name e.g. "game", "ready"
 */
const mark = (name) => {
    if (!(name in marks)) {
        marks[name] = performance.now();
    }
};

export default {
    marks,
    mark,
    source,
};
