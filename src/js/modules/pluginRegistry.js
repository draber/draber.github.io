/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import shortcutRegistry from "./shortcutRegistry.js";

// Temporary user override structure (will eventually move to settings)
const tmpSettings = {
    overview: {
        expanded: true,
        shortcuts: [
            {
                combo: "Alt+Shift+KeyO",
                method: "togglePane",
                enabled: true,
            },
        ],
    },
    letterCount: {
        expanded: true,
        shortcuts: [
            {
                combo: "Alt+Shift+KeyL",
                method: "togglePane",
                enabled: true,
            },
        ],
    },
    firstLetter: {
        expanded: true,
        shortcuts: [
            {
                combo: "Alt+Shift+KeyF",
                method: "togglePane",
                enabled: true,
            },
        ],
    },
    firstTwoLetters: {
        expanded: true,
        shortcuts: [
            {
                combo: "Alt+Shift+Digit2",
                method: "togglePane",
                enabled: true,
            },
        ],
    },
    pangrams: {
        expanded: true,
        shortcuts: [
            {
                combo: "Alt+Shift+KeyP",
                method: "togglePane",
                enabled: true,
            },
        ],
    },
    grid: {
        expanded: true,
        shortcuts: [
            {
                combo: "Alt+Shift+KeyG",
                method: "togglePopup",
                enabled: true,
            },
        ],
    },
    community: {
        expanded: true,
        shortcuts: [
            {
                combo: "Alt+Shift+KeyC",
                method: "togglePopup",
                enabled: true,
            },
        ],
    },
    spillTheBeans: {
        expanded: true,
        shortcuts: [
            {
                combo: "Alt+Shift+KeyB",
                method: "togglePane",
                enabled: true,
            },
        ],
    },
    darkMode: {
        expanded: true,
        shortcuts: [
            {
                combo: "Alt+Shift+KeyD",
                method: "togglePane",
                enabled: true,
            },
        ],
    },
    milestones: {
        expanded: true,
        shortcuts: [
            {
                combo: "Alt+Shift+KeyM",
                method: "togglePopup",
                enabled: true,
            },
        ],
    },
    todaysAnswers: {
        expanded: true,
        shortcuts: [
            {
                combo: "Alt+Shift+KeyT",
                method: "togglePopup",
                enabled: true,
            },
        ],
    },
    nytShortcuts: {
        expanded: true,
        shortcuts: [
            {
                combo: "Alt+Shift+KeyY",
                method: "showYesterday",
                enabled: true,
            },
            {
                combo: "Alt+Shift+KeyS",
                method: "showStats",
                enabled: true,
            },
        ],
    },
};

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

export default {
    getPlugins,
    register,
};
