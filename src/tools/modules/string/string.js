/**
 * Convert a string to camelCase
 * @see https://stackoverflow.com/a/2970667 with some modifications
 * @param {String} string 
 */
export const camelCase = string => {
    return string.replace(/[_-]+/, ' ').replace(/(?:^[\w]|[A-Z]|\b\w|\s+)/g, function (match, index) {
        if (+match === 0) return '';
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
};

/**
 * Convert a string to dash-case
 * @see https://stackoverflow.com/a/52964182 with some modifications
 * @param {String} string
 * @returns {String}
 */
export const dashCase = string => {
    return string.replace(/[\W_]+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map(part => part.toLowerCase())
        .join('-');
};

/**
 * (Dart) Sass adds a BOM to CSS with Unicode characters 
 * but this obiously also works in other contexts
 * @param {String} string
 * @returns {String}
 */
 export const removeBom = string => {
    return string.replace(/\uFEFF)/gu, '');
}