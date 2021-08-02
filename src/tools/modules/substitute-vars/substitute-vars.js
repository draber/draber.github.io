import settings from '../settings/settings.js';

/**
 * Replaces vars in the style {{my.var}} by their counterpart from settings
 * @param {String} input
 * @param {Object} settings
 * @returns {String}
 */
 const substituteVars = input => {
    return input.replace(/(?:{{([^}]+)}})/g, (full, second) => settings.get(second));
}

export default substituteVars;