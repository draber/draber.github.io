/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import fn from "fancy-node";
import settings from "../modules/settings.js";
import Plugin from "../modules/plugin.js";
import Popup from "./popup.js";
import { prefix } from "../utils/string.js";
import { utils } from "../utils/darkMode.utils.js";
import { ui } from "../utils/darkMode.ui.js";
import { isEmptyObject } from "../utils/utils.js";

/**
 * Dark Mode plugin
 *
 * @param {App} app
 * @returns {Plugin} DarkMode
 */
class DarkMode extends Plugin {
    /**
     * Toggle pop-up
     * @returns {DarkMode}
     */
    togglePopup() {
        if (this.popup.isOpen) {
            this.popup.toggle(false);
            return this;
        }
        this.popup.toggle(true);
        fn.$("input:checked", this.popup.ui).focus();
    }

    /**
     * Toggle dark mode
     * @param {Object} scheme {{ mode: 'light' | 'dark', hsl: { hue: number, sat: number, lig: number }}}
     * @returns {DarkMode}
     */
    applyColorScheme(scheme) {        
        if (!scheme.hsl || isEmptyObject(scheme.hsl)) {
            scheme.hsl = this.getStoredColorScheme().hsl;
        }

        document.body.dataset[prefix("theme")] = scheme.mode;
        document.body.style.setProperty("--dhue", scheme.hsl.hue);
        document.body.style.setProperty("--dsat", scheme.hsl.sat + "%");
        document.body.style.setProperty("--dlig", scheme.hsl.lig + "%");
        // don't override other keys such as shortcuts
        settings.set(`options.${this.key}.hsl`, scheme.hsl);
        settings.set(`options.${this.key}.mode`, scheme.mode);
        return this;
    }

    /**
     * Toggle between dark and light mode
     * @returns DarkMode
     */
    toggleColorScheme(){
        const scheme = this.getStoredColorScheme();
        scheme.mode = scheme.mode === 'dark' ? 'light' : 'dark';
        return this.applyColorScheme(scheme);
    }

    /**
     * DarkMode constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "Dark Mode", "Choose your vibe: shades for morning people and night owls.", {
            canChangeState: true,
            defaultState: false,
        });

        Object.assign(this, utils(this), ui(this));

        if (this.usesNonSbaDarkMode()) {
            this.applyColorScheme({mode:"light"});
            return;
        } else if (this.usesSbaDarkMode()) {
            // sba colors
            this.applyColorScheme({mode:"dark"});
        } else if (this.usesSystemDarkMode()) {
            // default sba colors
            this.applyColorScheme({mode:"dark"});
        } else {
            this.applyColorScheme({mode:"light"});
        }

        this.menuAction = "popup";
        this.menuIcon = "null";

        this.popup = new Popup(this.app, this.key)
            .setContent("title", this.title)
            .setContent("subtitle", this.description)
            .setContent(
                "body",
                fn.div({
                    classNames: [prefix("color-selector", "d")],
                    content: [this.getSwatches(), this.getHive()],
                })
            );

        this.shortcuts = [
            {
                combo: "Shift+Alt+D",
                method: "toggleColorScheme",
                label: "Dark Mode",
            },
            {
                combo: "Shift+Alt+K",
                method: "togglePopup",
                label: "Dark Mode Colors",
            },
        ];
    }
}

export default DarkMode;
