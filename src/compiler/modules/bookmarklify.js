#!/usr/bin/env node

/**
 * Converts javascript to a bookmarklet
 * @param js
 * @returns {string}
 */
const bookmarklify = js => {
    js = `(()=>{${js}})()`;
    return `javascript:${encodeURIComponent(js)}`;
}

module.exports = bookmarklify;