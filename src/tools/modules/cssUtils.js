#!/usr/bin/env node

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
    escapedRe
}

module.exports = cssUtils;