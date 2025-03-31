/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

import { getPopupCloser, manualDelete } from "./helpers";
import settings from "./settings";

/**
 * Registry of all registered shortcuts.
 * The key is the normalized combo (e.g., "Alt+Shift+KeyO"),
 * and the value is the shortcut object.
 */
let registry = new Map();

/**
 * Maps various modifier key names to a canonical form and human-readable label.
 * This allows flexible input like "ctrl" or "control", which both normalize to "Control".
 */
const modifierMap = new Map([
    ["ctrl", { canonical: "Control", human: "Ctrl" }],
    ["control", { canonical: "Control", human: "Ctrl" }],
    ["alt", { canonical: "Alt", human: "Alt" }],
    ["altgr", { canonical: "AltGraph", human: "AltGr" }],
    ["altgraph", { canonical: "AltGraph", human: "AltGr" }],
    ["meta", { canonical: "Meta", human: "Meta" }],
    ["shift", { canonical: "Shift", human: "Shift" }],
]);

/**
 * Canonical order of modifier keys, used when normalizing shortcut combos
 * to ensure consistent sorting.
 */
const order = Array.from(new Set(Array.from(modifierMap.values()).map((m) => m.canonical)));

/**
 * Tracks the single-character keys (A-Z) used in shortcuts,
 * grouped by origin (e.g. "sba" or "nyt"). Used to determine
 * if a manual delete is needed after firing the shortcut.
 */
const characterKeys = { nyt: [], sba: [] };

/**
 * Extract and register the letter key used in a shortcut,
 * only if it’s a single letter A-Z. Used for deciding
 * whether it needs post-shortcut deletion.
 *
 * @param {Object} shortcut - The shortcut object with `.combo` and optional `.origin`
 */
const registerCharacterKey = (shortcut) => {
    const key = getCharacterKey(shortcut.combo);
    if (!key || !/^[A-Z]$/.test(key)) {
        return;
    }
    characterKeys[shortcut.origin || "sba"].push(key);
};

/**
 * Extracts the main character key (letter or digit) from a combo string.
 * E.g., "Alt+Shift+KeyA" → "A", "Ctrl+Digit2" → "2"
 *
 * @param {String} combo
 * @returns {String} The character part of the combo in uppercase.
 */
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
            .join(" + ")
    );
};

/**
 * Determines whether a manually typed character needs to be deleted
 * after a shortcut is triggered. This is necessary when the letter
 * would otherwise be inserted into the game's input field.
 *
 * Logic:
 * - If a popup is open, assume we're dealing with an SBA shortcut (not NYT).
 * - Check whether the key is one of the registered SBA character keys.
 *
 * @param {String|Array|Object} combo - A shortcut combo (e.g., "Alt+Shift+KeyO")
 * @param {App} app - Reference to the main app, needed to detect popup state
 * @returns {Boolean} Whether the key requires deletion from the input field
 */
const requiresDeletion = (combo, app) => {
    const key = getCharacterKey(normalizeCombo(combo));
    let pool = getPopupCloser(app) ? characterKeys.sba : characterKeys.sba.join(characterKeys.nyt);
    return key && pool.includes(key);
};

/**
 * Checks whether the given object is a valid shortcut config.
 *
 * A valid shortcut must be an object with:
 * - a `combo` string (e.g. "Alt+Shift+O")
 * - a `callback` function to invoke when the shortcut is triggered
 *
 * @param {Object} obj
 * @returns {Boolean} True if the object is a valid shortcut
 */
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
        data = data.replace(/\s+/g, "");
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
    if (code) {
        data.push(code);
    }
    return data.join("+");
};

const getSbaShortcutEntry = (event) => get(normalizeCombo(event));

/**
 * Handle keyboard shortcuts
 * @param {Event} event
 * @returns {boolean}
 */
const handleShortcut = (event) => {
    const entry = getSbaShortcutEntry(event);
    if (!entry || !entry.enabled) {
        return false;
    }
    event.preventDefault();
    if (!getCharacterKey(normalizeCombo(event))) {
        entry.callback();
        return true;
    }
    manualDelete();
    entry.callback();
    return true;
};

const set = (combo, shortcut) => {
    combo = normalizeCombo(combo);
    if (!isValidShortcut(shortcut)) {
        return false;
    }
    if(!shortcut.human){
        shortcut.human = comboToHuman(shortcut.combo);
    }
    if(typeof shortcut.enabled === 'undefined'){
        shortcut.enabled = true
    }
    registry.set(combo, shortcut);
    settings.set(`options.${shortcut.module}.shortcuts.${shortcut.combo}`, shortcut);
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
    const overrides = settings.get(`options.${shortcut.module}.shortcuts.${shortcut.combo}`) || {};
    Object.assign(shortcut, { enabled: true }, overrides, {
        human: comboToHuman(shortcut.combo),
    });

    if (registry.has(shortcut.combo)) {
        console.warn(`Ignoring ${shortcut.human}, this shortcut is already registered`);
        return false;
    }

    registerCharacterKey(shortcut);
    delete shortcut.origin;

    set(shortcut.combo, shortcut);
    return true;
};

const getRegistry = () => {
    return registry;
};

/**
 * Retrieve a callback by key combination
 * @param {String|Array|Event} input
 * @returns {Object|Boolean}
 */
const get = (input) => {
    const combo = normalizeCombo(input);
    if (!registry.has(combo)) {
        return false;
    }
    return registry.get(combo);
};

export default {
    set,
    add,
    get,
    normalizeCombo,
    handleShortcut,
    getCharacterKey,
    requiresDeletion,
    getSbaShortcutEntry,
    getRegistry,
};
