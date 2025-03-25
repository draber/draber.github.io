/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import shortcutRegistry from './shortcutRegistry.js';

// Temporary user override structure (will eventually move to settings)
const tmpSettings = {
    "score":
    {
        "expanded": true,
        "shortcuts": [
        {
            "combo": "Alt+Shift+KeyX",
            "method": "togglePanePane",
            "enabled": true
        }]
    },
    "letterCount":
    {
        "expanded": true,
        "shortcuts": [
        {
            "combo": "Alt+Shift+KeyL",
            "method": "togglePanePane",
            "enabled": true
        }]
    },
    "firstLetter":
    {
        "expanded": true,
        "shortcuts": [
        {
            "combo": "Alt+Shift+KeyF",
            "method": "togglePanePane",
            "enabled": true
        }]
    },
    "firstTwoLetters":
    {
        "expanded": true,
        "shortcuts": [
        {
            "combo": "Alt+Shift+Digit2",
            "method": "togglePanePane",
            "enabled": true
        }]
    },
    "pangrams":
    {
        "expanded": true,
        "shortcuts": [
        {
            "combo": "Alt+Shift+KeyP",
            "method": "togglePanePane",
            "enabled": true
        }]
    },
    "grid":
    {
        "expanded": true,
        "shortcuts": [
        {
            "combo": "Alt+Shift+KeyG",
            "method": "display",
            "enabled": true
        }]
    },
    "spillTheBeans":
    {
        "expanded": true,
        "shortcuts": [
        {
            "combo": "Alt+Shift+KeyB",
            "method": "togglePane",
            "enabled": true
        }]
    },
    "darkMode":
    {
        "expanded": true,
        "shortcuts": [
        {
            "combo": "Alt+Shift+KeyD",
            "method": "togglePane",
            "enabled": true
        }]
    },
    "milestones":
    {
        "expanded": true,
        "shortcuts": [
        {
            "combo": "Alt+Shift+KeyM",
            "method": "display",
            "enabled": true
        }]
    },
    "todaysAnswers":
    {
        "expanded": true,
        "shortcuts": [
        {
            "combo": "Alt+Shift+KeyA",
            "method": "display",
            "enabled": true
        }]
    },
    "nytShortcuts":
    {
        "expanded": true,
        "shortcuts": [
        {
            "combo": "Alt+Shift+KeyY",
            "method": "showYesterday",
            "enabled": true
        },
        {
            "combo": "Alt+Shift+KeyS",
            "method": "showStats",
            "enabled": true
        }]
    }
};

const plugins = new Map();

const register = (Plugin, app) => {
    const instance = new Plugin(app);
    instance.add();
    plugins.set(instance.key, instance);

    const pluginKey = instance.key;
    const overrides = tmpSettings[pluginKey]?.shortcuts || [];

    (instance.shortcuts || []).map((shortcut) => {
        const override = overrides.find(o => o.method === shortcut.method);
        const merged = {
            enabled: true,
            ...shortcut,
            ...override
        };

        if (merged.enabled === false) return;

        const normalized = shortcutRegistry.normalizeCombo(merged.combo);
        const isCharKey = shortcutRegistry.getCharacterKey(normalized);

        const callback = isCharKey
            ? () => {
                  setTimeout(() => {
                      const el = document.querySelector(".hive-action__delete");
                      el.dispatchEvent(new Event("touchstart", { bubbles: true, cancelable: true }));
                      setTimeout(() => {
                          el.dispatchEvent(new Event("touchend", { bubbles: true, cancelable: true }));
                      }, 50);
                      instance[merged.method]();
                  }, 0);
              }
            : () => instance[merged.method]();

        shortcutRegistry.set(normalized, callback, {
            plugin: pluginKey,
            label: merged.method
        });
    });
};

//const get = (key) => plugins.get(key);
//const list = () => Array.from(plugins.values());

const getPlugins = () => plugins;

const handleShortcut = (event) => shortcutRegistry.handleShortcut(event);

export default {
    getPlugins,
    register,
    handleShortcut
   // get,
   // list
};
