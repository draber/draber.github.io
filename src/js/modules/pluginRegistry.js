/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import shortcutRegistry from "./shortcutRegistry.js";

/**
 * All plugin instances, keyed by plugin key
 * @type {Map<String, Plugin>}
 */
const plugins = new Map();

/**
 * Instantiate a plugin, add it to the DOM and register its shortcuts
 * @param {Function} Plugin plugin class
 * @param {App} app
 */
const register = (Plugin, app) => {
    const instance = new Plugin(app);
    instance.add();
    plugins.set(instance.key, instance);

    (instance.shortcuts || []).forEach((instanceShortcut) => {
        const { method, ...remainder } = instanceShortcut;
        const shortcut = {
            ...remainder,
            label: instanceShortcut.label || instance.title,
            module: instance.key,
            callback: () => instance[method](),
        };

        shortcutRegistry.add(shortcut);
    });
};

/**
 * All plugin instances
 * @returns {Map<String, Plugin>}
 */
const getPlugins = () => plugins;

/**
 * A single plugin instance
 * @param {String} key
 * @returns {Plugin}
 * @throws {Error} if there is no such plugin
 */
const getPluginByKey = (key) => {
    if (!plugins.has(key)) {
        throw new Error(`Plugin with key "${key}" not found.`);
    }
    return plugins.get(key);
};

export default {
    getPlugins,
    getPluginByKey,
    register,
};
