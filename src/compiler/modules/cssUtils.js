#!/usr/bin/env node

/**
 * Keys found by getFindings()
 * @type {Set<any>}
 */
let keys;

/**
 * Escapes a regular expression
 * @param  {String} pattern
 * @returns {RegExp}
 */
const escapedRe = (pattern, flags) => {
    pattern = pattern.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    return new RegExp(pattern, flags);
}

/**
 * Find custom properties, both definitions an usages
 * @param css
 * @returns {{}}
 */
const getFindings = css => {
    keys = new Set();
    const findings = {};
    const defs = css.matchAll(/((--[-\w]+):([^;}]+))(?:;|})/g);
    const usages = css.matchAll(/(var\(([-\w]+)\))/g);
    for (const match of defs) {
        // considers multiple defs
        const set = findings[match[2]] ? findings[match[2]].defs : new Set();
        set.add(match[0].replace(/}$/, ''));
        keys.add(match[2]);
        findings[match[2]] = {
            defs: set,
            found: false
        }
    }

    for (const match of usages) {
        keys.add(match[2]);
        if (findings[match[2]]) {
            findings[match[2]].found = true;
        }
    }
    return findings;
};

/**
 * (Dart) Sass adds a BOM to CSS with Unicode characters
 * and leaves a line-break at the end which some modules
 * convert to \n
 * @param {String} css
 * @returns {String}
 */
const removeBom = css => {
    return css.replace(/(\uFEFF|\\n)/gu, '');
}

const cssUtils = {
    removeBom,
}

module.exports = cssUtils;