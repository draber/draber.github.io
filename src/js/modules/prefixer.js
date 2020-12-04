import settings from './settings.js';

/**
 * Convert a string to camelCase
 * @see https://gist.github.com/cawfree/c08c10f6f2e7b2c8d225d88b031a03ce#file-case-js
 * @param {String} term 
 */
const toCamelCase = term => {
    return term.replace(/[_-]+([a-z])/g, (g) => g[1].toUpperCase());
};

/**
 * Convert a string to dash-case
 * @see `snake_case` @https://gist.github.com/cawfree/c08c10f6f2e7b2c8d225d88b031a03ce#file-case-js
 * @param {String} term 
 */
const toDashCase = term => {
    return term.match(/([A-Z])/g).reduce(
            (str, c) => str.replace(new RegExp(c), '-' + c.toLowerCase()),
            term
        )
        .substring((term.slice(0, 1).match(/([A-Z])/g)) ? 1 : 0);
};

/**
 * 
 * @param {String} term 
 * @param {String} mode 
 */
const pf = (term, mode = 'c') => {
    switch (mode) {
        case 'c':
            return toCamelCase(settings.get('prefix') + '_' + term);
        case 'd':
            return toDashCase(settings.get('prefix') + term.charAt(0).toUpperCase() + term.slice(1));
        default:
            return term;
    }
}

export default pf;