/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import * as config from "../../config/config.json" assert { type: "json" };
import * as pkg from "../../../package.json" assert { type: "json" };

const storageKey = `${config.prefix}-settings`;

/**
 * Core settings state containing metadata and user-defined options.
 */
const state = {
    version: pkg.version,
    label: config.label,
    title: config.title,
    url: config.url,
    prefix: config.prefix,
    support: config.support,
    targetUrl: config.targetUrl,
    options: JSON.parse(localStorage.getItem(storageKey) || "{}"),
};

/**
 * Persist the current settings options to localStorage.
 */
const saveOptions = () => {
    localStorage.setItem(storageKey, JSON.stringify(state.options));
};

/**
 * Perform one-time migration from legacy settings structure to 5.0.0 format.
 * 
 * - Preserves objects like "darkModeColors" as-is
 * - Records oldVersion and updates to new version
 * 
 * This function is safe to leave in place. It will only run if legacy format is detected.
 */
const migrateToVersion5 = () => {
    if (typeof state.options.darkMode !== "boolean") return; // Only run once on old format

    console.warn(`⚠️ ${state.label} detected legacy settings format. Performing migration to 5.0.0...`);

    const migrated = {};
    const obsoleteKeys = ["darkModeColors", "yourProgress", "version", "oldVersion", "score", "community"];
    const removeSubkeys = ["enabled", "shortcuts"];
    
    for (const [key, value] of Object.entries(state.options)) {
        if (obsoleteKeys.includes(key)) continue;
    
        // darkMode comes later
        if (key === "darkMode") continue;
    
        if (typeof value === "object") {
            const cleaned = { ...value };
            removeSubkeys.forEach(k => delete cleaned[k]);
            migrated[key] = cleaned;
        }
    }
    
    // special case darkMode
    if ("darkMode" in state.options) {        
        const scheme = {
            mode: !!state.options.darkMode ? "dark" : "light",
            // @see _colors.scss [data-sba-theme] --dhue, --dsat and --dlig
            hsl: {
                hue: 0,
                sat: 0,
                lig: 7,
            },
        };
    
        if (typeof state.options.darkModeColors === "object") {
            scheme.hsl = Object.assign(scheme.hsl, state.options.darkModeColors)
        }
    
        migrated.darkMode = scheme;
    }
    
    state.options = {
        ...migrated,
        version: "5.0.0",
        oldVersion: state.options.version || null
    };

    //console.info(`Migration completed with the following data:`, state.options);
    //throw new Error("Migration to version 5.0.0 complete. Please reload the page.");
    saveOptions();
    
};

// Trigger version-aware migration
migrateToVersion5();

/**
 * Retrieve a value from the settings object using dot notation.
 *
 * @param {string} path - Dot-notated path (e.g. "options.darkMode.hsl").
 * @returns {*} - The corresponding value or `undefined` if not found.
 */
const get = (path) => {
    const parts = path.split(".");
    let current = state;
    for (const part of parts) {
        if (typeof current !== "object" || !(part in current)) {
            return undefined;
        }
        current = current[part];
    }
    return current;
};

/**
 * Set a value within the settings object using dot notation.
 * Creates intermediate objects if they do not exist.
 *
 * @param {string} path - Dot-notated path (e.g. "options.darkMode.hsl").
 * @param {*} value - The value to assign.
 * @returns {boolean} - True if the value was set, false if an error occurred.
 */
const set = (path, value) => {
    const parts = path.split(".");
    const last = parts.pop();
    let current = state;
    for (const part of parts) {
        if (typeof current[part] !== "object") {
            if (typeof current[part] !== "undefined") {
                console.error(`${part} is not an object`);
                return false;
            }
            current[part] = {};
        }
        current = current[part];
    }
    current[last] = value;
    saveOptions();
    return true;
};

/**
 * Delete a value from the settings using dot notation.
 *
 * @param {string} path - Dot-notated path to delete.
 * @returns {boolean} - True if deletion was successful, false otherwise.
 */
const remove = (path) => {
    const parts = path.split(".");
    const last = parts.pop();
    let current = state;
    for (const part of parts) {
        if (typeof current[part] !== "object") {
            return false;
        }
        current = current[part];
    }
    if (last in current) {
        delete current[last];
        saveOptions();
        return true;
    }
    return false;
};

/**
 * Get the full state object (useful for debugging or export).
 *
 * @returns {object} - A deep clone of the internal state.
 */
const getAll = () => JSON.parse(JSON.stringify(state));

export default {
    get,
    set,
    delete: remove,
    getAll,
};
