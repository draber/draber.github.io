#!/usr/bin/env node

/**
 * Ensure the code is immediately invocable
 * Note, that the regExp only checks if code execution takes place at the end
 * @param js
 * @returns {String}
 */
const makeIife = js => {
    return /\([\w\s,]*\)\s*\)?;?$/.test(js) ? js : `(()=>{${js}})()`;
}

/**
 * Converts javascript to a bookmarklet
 * @param js
 * @returns {string}
 */
const bookmarklify = js => {
    return `javascript:${encodeURIComponent(makeIife(js))}`;
}

module.exports = bookmarklify;