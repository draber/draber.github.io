/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import fn from "fancy-node";
import settings from "../modules/settings.js";
import Plugin from "../modules/plugin.js";
import PopupBuilder from "../widgets/popupBuilder.js";
import { prefix } from "../utils/string.js";
import { utils } from "../utils/darkMode.utils.js";
import { ui } from "../utils/darkMode.ui.js";

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
        // keyboard users can pick a color with the arrow keys right away
        fn.$("input:checked", this.popup.ui)?.focus();
        return this;
    }

    /**
     * Apply a color scheme and store it
     * @param {Object} scheme {{ mode: 'light' | 'dark', hsl: { hue: number, sat: number, lig: number }}}
     * @returns {DarkMode}
     */
    applyColorScheme(scheme) {
        // scheme has mode but no valid hsl
        scheme = this.ensureValidColorScheme(scheme);

        document.body.dataset[prefix("theme")] = scheme.mode;
        document.body.style.setProperty("--sba-dhue", scheme.hsl.hue);
        document.body.style.setProperty("--sba-dsat", scheme.hsl.sat + "%");
        document.body.style.setProperty("--sba-dlig", scheme.hsl.lig + "%");
        // don't override other keys such as shortcuts
        settings.set(`options.${this.key}.hsl`, scheme.hsl);
        settings.set(`options.${this.key}.mode`, scheme.mode);
        return this;
    }

    /**
     * Toggle between dark and light mode
     * @returns {DarkMode}
     */
    toggleColorScheme() {
        const scheme = this.ensureValidColorScheme();
        scheme.mode = scheme.mode === "dark" ? "light" : "dark";
        return this.applyColorScheme(scheme);
    }

    /**
     * DarkMode constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "Dark Mode", "Choose your vibe: shades for morning people and night owls.");

        Object.assign(this, utils(this), ui(this));

        let found3rdPartyDm = false;

        if (this.usesNonSbaDarkMode()) {
            this.applyColorScheme({ mode: "dark" });
            found3rdPartyDm = true;
        } else {
            this.applyColorScheme(settings.get(`options.${this.key}`));
        }

        this.menu = {
            action: "popup",
        };

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

        this.popup = new PopupBuilder(this.app, this.key);

        if (!found3rdPartyDm) {
            this.popup
                .setContent("title", this.title)
                .setContent("subtitle", this.description)
                .setContent(
                    "body",
                    fn.div({
                        classNames: [prefix("color-selector", "d")],
                        content: [this.getSwatches(), this.getHive()],
                    })
                );
        } else {
            this.popup.setContent("title", "Dark Mode disabled").setContent(
                "subtitle",
                fn.toNode([
                    fn.p({
                        content: `Spelling Bee Assistant’s dark mode has been turned off because another dark theme (likely from the NYT) was detected.`,
                    }),
                    fn.p({
                        content: `If you prefer SBA’s dark mode, consider disabling the other one.`,
                    }),
                ])
            );
        }

    }
}

export default DarkMode;
