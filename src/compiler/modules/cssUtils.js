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
 * Shorten the name of a custom property
 * @param {String} prefix
 * @returns {string}
 */
const getShort = prefix => {
    let i = 0;
    prefix = '--' + prefix;
    while (keys.has(prefix + i)) {
        i++;
    }
    keys.add(prefix + i)
    return prefix + i;
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

/**
 * Removes unused custom props, optionally shortens remaining ones
 * @param css
 * @param shortCodes
 * @param prefix
 * @returns {*}
 */
const handleCustomProps = (css, {
    shortCodes = true,
    prefix = 'x'
} = {}) => {
    const findings = getFindings(css);

    for (const [key, value] of Object.entries(findings)) {
        if (!value.found) {
            value.defs.forEach(def => {
                css = css.replace(escapedRe(def, 'g'), '');
            })
        } else if (shortCodes) {
            css = css.replace(escapedRe(key, 'g'), getShort(prefix));
        }
    }
    return css;
}

const cssUtils = {
    handleCustomProps,
    removeBom,
}

module.exports = cssUtils;