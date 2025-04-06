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
 * - Converts top-level boolean values like "darkMode": true
 *   into structured objects: "darkMode": { enabled: true }
 * - Preserves objects like "darkModeColors" as-is
 * - Records oldVersion and updates to new version
 * 
 * This function is safe to leave in place. It will only run if legacy format is detected.
 */
const migrateToVersion5 = () => {
    if (typeof state.options.darkMode !== "boolean") return; // Only run once on old format

    console.warn(`⚠️ ${state.label} detected legacy settings format. Performing migration to 5.0.0...`);

    // Renamed modules
    state.options.overview = state.options.score || {};
    delete state.options.score;
    state.options.milestones = state.options.yourProgress || {};
    delete state.options.yourProgress;

    const migrated = {};

    for (const [key, value] of Object.entries(state.options)) {
        if (["version", "oldVersion"].includes(key)) continue;

        if (typeof value === "object") {
            migrated[key] = value;
        } else if (typeof value === "boolean") {
            migrated[key] = { enabled: value };
        }
    }

    state.options = {
        ...migrated,
        version: state.version,
        oldVersion: state.options.version || null
    };

    saveOptions();
};

// Trigger version-aware migration
migrateToVersion5();

/**
 * Retrieve a value from the settings object using dot notation.
 *
 * @param {string} path - Dot-notated path (e.g. "options.darkMode.enabled").
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
 * @param {string} path - Dot-notated path (e.g. "options.darkMode.enabled").
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
