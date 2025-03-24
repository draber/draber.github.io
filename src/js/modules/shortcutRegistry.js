/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

let registry = new Map();

const modifierMap = new Map([
    ["ctrl", { canonical: "Control", human: "Ctrl" }],
    ["control", { canonical: "Control", human: "Ctrl" }],
    ["alt", { canonical: "Alt", human: "Alt" }],
    ["altgr", { canonical: "AltGraph", human: "AltGr" }],
    ["altgraph", { canonical: "AltGraph", human: "AltGr" }],
    ["meta", { canonical: "Meta", human: "Meta" }],
    ["shift", { canonical: "Shift", human: "Shift" }],
]);

const order = Array.from(new Set(Array.from(modifierMap.values()).map((m) => m.canonical)));

const getCharacterKey = (combo) => {
    const match = combo.match(/(?:^|\+)(?:Key|Digit)?([A-Za-z0-9])(?:\+|$)/i);
    return match ? match[1].toUpperCase() : "";
};

/**
 * Normalize a key combination
 * @param {String|Array|Event} data
 * @returns {String|Null}
 */
const normalizeCombo = (data) => {
    // cast event to array
    if (data instanceof KeyboardEvent) {
        if (!getCharacterKey(data.code)) {
            return data.code;
        }
        const parts = [];
        order.forEach((modifier) => {
            if (data.getModifierState(modifier)) {
                parts.push(modifier);
            }
        });
        // only store letters and digits, not ShiftLeft and such
        if (!modifierMap.has(data.key.toLowerCase())) {
            parts.push(data.code);
        }
        data = parts;
    }

    // cast string to array
    if (typeof data === "string") {
        data = data
            .split("+")
            .map((part) =>
                part.toUpperCase() === getCharacterKey(data)
                    ? (!isNaN(part) ? "Digit" : "Key") + part.toUpperCase()
                    : part
            );
    }

    // should be an array by now
    if (!Array.isArray(data)) {
        throw new Error("Unsupported input type for combo normalization");
    }

    const code = data.filter((part) => part.startsWith("Key") || part.startsWith("Digit")).join("");

    data = data
        .filter((part) => part !== code)
        .map((part) => {
            part = part.toLowerCase();
            if (!modifierMap.has(part)) {
                throw new Error(`Unsupported key part: ${part}`);
            }
            return modifierMap.get(part).canonical;
        });
    data.sort();
    data.push(code);
    return data.join("+");
};

/**
 * Handle keyboard shortcuts
 * @param {Event} event
 * @returns {boolean}
 */
const handleShortcut = (event) => {
    const entry = get(event);
    if (!entry) return false;
    event.preventDefault();
    entry.callback();
    return true;
};

/**
 * Register a new shortcut
 * @param {String|Array|Event} input
 * @param {Function} callback
 */
const set = (input, callback) => {
    const combo = normalizeCombo(input);
    if (registry.has(combo)) {
        console.warn(`Shortcut ${combo} already registered`);
    }
    const label = combo
        .split("+")
        .map((part) => (modifierMap.has(part) ? modifierMap.get(part).human : part.replace(/^Digit|^Key/, "")))
        .join("+");
    registry.set(combo, { callback, label });
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
    getCharacterKey,
    registry,
};
