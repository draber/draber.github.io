#!/usr/bin/env node

/**
 * Replaces vars in the style {{my.var}} by their counterpart from settings
 * @param {String} input
 * @param {Object} settings
 * @returns {String}
 */
const substituteVars = (input, settings) => {
    return input.replace(/(?:{{([^}]+)}})/g, (full, second) => settings.get(second));
}

module.exports = substituteVars;