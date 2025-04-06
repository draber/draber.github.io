/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import shortcutRegistry from "./shortcutRegistry.js";

const plugins = new Map();

const register = (Plugin, app) => {
    const instance = new Plugin(app);
    instance.add();
    plugins.set(instance.key, instance);

    (instance.shortcuts || []).map((instanceShortcut) => {
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

const getPlugins = () => plugins;

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
