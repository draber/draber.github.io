/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

let registry = new Map();

/**
 * Normalize a key combination
 * @param {String|Array|Event} data
 * @returns
 */
const normalizeCombo = (data) => {
    // cast to array
    if (data instanceof KeyboardEvent) {
        let parts = [];
        if (data.ctrlKey) parts.push("CONTROL");
        if (data.metaKey) parts.push("META");
        if (data.altKey) parts.push("ALT");
        if (data.shiftKey) parts.push("SHIFT");
        parts.push(data.code);
        data = parts;
    }

    if (typeof data === "string") {
        data = data.split("+").map((part) => {
            if (part.length !== 1) {
                return part;
            }
            return (!isNaN(part) ? "Digit" : "Key") + part;
        });
    }

    // should be an array by now
    if (!Array.isArray(data)) {
        throw new Error("Unsupported input type for combo normalization");
    }

    data = data.map((part) => part.trim().toUpperCase().replace("CTRL", "CONTROL"));
    return data.sort().join("+");
};

/**
 * Handle keyboard shortcuts
 * @param {Event} event
 * @returns {boolean}
 */
const handleShortcut = (event) => {
    const callback = get(event);
    if (!callback) {
        return false;
    }
    event.preventDefault();
    callback();
    return true;
};

/**
 * Register a new shortcut
 * @param {String|Array|Evant} input
 * @param {Function} callback
 */
const set = (input, callback) => {
    const combo = normalizeCombo(input);
    registry.set(combo, callback);
};

/**
 * Retrieve a callback by key combination
 * @param {String|Array|Evant} input
 * @returns
 */
const get = (input) => {
    return registry.get(normalizeCombo(input));
};

export default {
    set,
    get,
    normalizeCombo,
    handleShortcut,
    registry,
};
