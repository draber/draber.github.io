import settings from './settings.js';

/**
 * Prefix used for event names and such
 * @type {String}
 */
const pf = settings.get('prefix');

/**
 * Convert a string to camelCase
 * @see https://stackoverflow.com/a/2970667 with some modifications
 * @param {String} term 
 */
export const camel = term => {
    return term.replace(/[_-]+/, ' ').replace(/(?:^[\w]|[A-Z]|\b\w|\s+)/g, function (match, index) {
        if (+match === 0) return '';
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
};

/**
 * Convert a string to dash-case
 * @see https://stackoverflow.com/a/52964182 with some modifications
 * @param {String} term
 * @returns {String}
 */
export const dash = term => {
    return term.replace(/[\W_]+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toLowerCase())
        .join('-');
};

/**
 * Prefix a key and format the result as either camelCase or dash-case
 * @param {String} term
 * @param {String} mode `c` for camelCase | `d` for dash-case
 * @returns {String}
 */
export const prefix = (term, mode = 'c') => {
    switch (mode) {
        case 'c':
            return camel(pf + '_' + term);
        case 'd':
            return dash(pf + term.charAt(0).toUpperCase() + term.slice(1));
        default:
            return pf + term;
    }
}