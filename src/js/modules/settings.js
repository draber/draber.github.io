/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import * as config from "../../config/config.json" with { type: "json" };
import * as pkg from "../../../package.json" with { type: "json" };

const storageKey = `${config.prefix}-settings`;

/**
 * Version of the structure in `options`, unrelated to the app version.
 * Raise it when the structure changes and add a migration below.
 */
const schema = 1;

/**
 * Migrations, keyed by the schema they lead to. Each one receives the options of the previous schema
 * and returns the new ones. They run in order, each one exactly once.
 * @example
 * 2: (options) => {
 *     options.grid = { ...options.grid, pinned: false };
 *     return options;
 * },
 */
const migrations = {};

/**
 * Wrapper around localStorage, which can be unavailable (privacy settings) or full.
 * Settings must never stop the assistant from starting, the worst case is a session with defaults.
 */
const storage = {
    read() {
        try {
            return localStorage.getItem(storageKey);
        } catch (err) {
            console.warn(`${config.label}: can't read the settings, using defaults`, err);
            return null;
        }
    },
    write(value) {
        try {
            localStorage.setItem(storageKey, value);
        } catch (err) {
            console.warn(`${config.label}: can't save the settings`, err);
        }
    },
    /**
     * Keep a copy of unusable settings for a bug report instead of throwing them away
     * @param {String} raw
     */
    backup(raw) {
        try {
            localStorage.setItem(`${storageKey}-broken`, raw);
        } catch (err) {
            // nothing else to be done
        }
    },
};

/**
 * @param {*} value
 * @returns {Boolean} true for `{}`, false for arrays, null and anything else
 */
const isPlainObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);

/**
 * Read the stored options, repair what can't be used and bring them to the current schema.
 * @returns {Object}
 */
const loadOptions = () => {
    const raw = storage.read();
    if (raw === null) {
        return { schema };
    }

    let options;
    try {
        options = JSON.parse(raw);
    } catch (err) {
        options = null;
    }
    if (!isPlainObject(options)) {
        console.warn(`${config.label}: the stored settings are unusable, starting with defaults. A copy is in ${storageKey}-broken`);
        storage.backup(raw);
        return { schema };
    }

    // 5.x had no schema but `version` (always "5.0.0") and `oldVersion`
    if (typeof options.schema !== "number") {
        delete options.version;
        delete options.oldVersion;
        options.schema = 1;
    }

    // written by a newer version, e.g. after going back from a beta: don't touch
    if (options.schema > schema) {
        return options;
    }

    while (options.schema < schema) {
        const next = options.schema + 1;
        try {
            options = migrations[next] ? migrations[next](options) : options;
        } catch (err) {
            console.warn(`${config.label}: migration to settings schema ${next} failed, starting with defaults`, err);
            storage.backup(raw);
            return { schema };
        }
        options.schema = next;
    }
    return options;
};

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
    issues: config.issues,
    targetUrl: config.targetUrl,
    options: loadOptions(),
};

/**
 * Persist the current settings options to localStorage.
 */
const saveOptions = () => {
    storage.write(JSON.stringify(state.options));
};

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
        // missing or left over from an older structure, e.g. `true` where an object is expected now
        if (!isPlainObject(current[part])) {
            if (typeof current[part] !== "undefined") {
                console.warn(`${config.label}: replacing the outdated value of ${part} in the settings`);
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
