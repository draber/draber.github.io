/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

import { getPopupCloser, manualDelete } from "./helpers";
import settings from "./settings";

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

const characterKeys = { nyt: [], sba: [] };

const registerCharacterKey = (shortcut) => {
    const key = getCharacterKey(shortcut.combo);
    if (!key || !/^[A-Z]$/.test(key)) {
        return;
    }
    characterKeys[shortcut.origin || "sba"].push(key);
};

const getCharacterKey = (combo) => {
    const match = combo.match(/(?:^|\+)(?:Key|Digit)?([A-Za-z0-9])(?:\+|$)/i);
    return match ? match[1].toUpperCase() : "";
};

/**
 * Build a more human readable form of combo
 * @param {String} combo
 * @returns {String}
 */
const comboToHuman = (combo) => {
    return (
        combo
            .split("+")
            // modifierMap = Ctrl => Control etc.
            .map((part) => (modifierMap.has(part) ? modifierMap.get(part).human : part.replace(/^Digit|^Key/, "")))
            .join("+")
    );
};

const requiresDeletion = (combo, app) => {
    const key = getCharacterKey(normalizeCombo(combo));
    let pool = getPopupCloser(app) ? characterKeys.sba : characterKeys.sba.join(characterKeys.nyt);
    return key && pool.includes(key);
};

const isValidShortcut = (obj) =>
    obj && typeof obj === "object" && typeof obj.combo === "string" && typeof obj.callback === "function";

/**
 * Normalize a key combination
 * @param {String|Array|Event} data
 * @returns {String|Null}
 */
const normalizeCombo = (data) => {
    // cast event to array
    if (data instanceof KeyboardEvent) {
        const parts = [];
        order.forEach((modifier) => {
            if (data.getModifierState(modifier)) {
                parts.push(modifier);
            }
        });
        // include the key (code) even if not a character key (e.g., Escape)
        parts.push(data.code);
        data = parts;
    }

    // handle shortcuts, combo will be further processed in the next step
    if (isValidShortcut(data)) {
        data = data.combo;
    }

    // cast string to array
    if (typeof data === "string") {
        const charKey = getCharacterKey(data);
        data = data
            .split("+")
            .map((part) =>
                part.toUpperCase() === charKey ? (!isNaN(part) ? "Digit" : "Key") + part.toUpperCase() : part
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
                return part.charAt(0).toUpperCase() + part.slice(1); // fallback for things like "Escape"
            }
            return modifierMap.get(part).canonical;
        });
    data.sort();
    if (code) data.push(code);
    return data.join("+");
};

const getSbaShortcutEntry = (event) => get(normalizeCombo(event));

/**
 * Handle keyboard shortcuts
 * @param {Event} event
 * @returns {boolean}
 */
const handleShortcut = (event, lastLetterNode) => {
    const entry = getSbaShortcutEntry(event);
    if (!entry) {
        return false;
    }
    event.preventDefault();
    if (!getCharacterKey(normalizeCombo(event))) {
        entry.callback();
        return true;
    }
    manualDelete(lastLetterNode);
    entry.callback();
    return true;
};

/**
 * Register a new shortcut
 * @param {Object} shortcut
 * @return {Boolean}
 */
const add = (shortcut) => {
    if (!isValidShortcut(shortcut)) {
        throw new Error("Invalid shortcut");
    }

    shortcut.combo = normalizeCombo(shortcut);
    const overrides = settings.get(`shortcuts.${shortcut.module}.${shortcut.combo}`) || {};
    Object.assign(shortcut, { enabled: true }, overrides, {
        human: comboToHuman(shortcut.combo),
    });

    if (!shortcut.enabled) {
        return false;
    }

    if (registry.has(shortcut.combo)) {
        console.warn(`Ignoring ${shortcut.human}, this shortcut is already registered`);
        return false;
    }

    registerCharacterKey(shortcut);
    delete shortcut.origin;

    registry.set(shortcut.combo, shortcut);
    return true;
};

const getRegistry = ()=> {
    return registry;
}

/**
 * Retrieve a callback by key combination
 * @param {String|Array|Event} input
 * @returns
 */
const get = (input) => {
    return registry.get(normalizeCombo(input));
};

export default {
    add,
    get,
    normalizeCombo,
    handleShortcut,
    getCharacterKey,
    requiresDeletion,
    getSbaShortcutEntry,
    getRegistry,
};
