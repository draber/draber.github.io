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
import { prefix } from "../modules/string.js";
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
        // fn.$(".sba-color-selector .hive", this.popup.ui).dataset[prefix("theme")] = "dark";
        fn.$("input:checked", this.popup.ui).focus();
    }

    /**
     * Toggle dark mode
     * @param {Object} {{ hue: number, sat: number, lig: number }} hslObj
     * @returns {DarkMode}
     */
    toggleColorScheme(hslObj = {}) {
        let newMode;
        if (!hslObj) {
            const oldMode = document.body.dataset[prefix("theme")] || "light";
            newMode = oldMode === "dark" ? "light" : "dark";
            hslObj = this.getColorParameters(newMode);
        } else {
            newMode = this.getModeFromHsl(hslObj);
        }
        document.body.dataset[prefix("theme")] = newMode;
        document.body.style.setProperty("--dhue", hslObj.hue);
        document.body.style.setProperty("--dsat", hslObj.sat + "%");
        document.body.style.setProperty("--dlig", hslObj.lig + "%");
        settings.set(`options.${self.key}`, hslObj);
        return this;
    }

    /**
     * DarkMode constructor
     * @param {App} app
     */
    constructor(app) {
        super(app, "Dark Mode Themes", "Choose your vibe: shades for morning people and night owls.", {
            canChangeState: true,
            defaultState: false,
        });

        Object.assign(this, utils(this), ui(this));

        if (this.usesNonSbaDarkMode()) {
            this.toggleColorScheme(this.getColorParameters("light"));
            return;
        } else if (this.usesSbaDarkMode()) {
            // sba colors
            this.toggleColorScheme(this.getColorParameters("dark"));
        } else if (this.usesSystemDarkMode()) {
            // default sba colors
            this.toggleColorScheme(this.getColorParameters("dark"));
        } else {
            this.toggleColorScheme(this.getColorParameters("light"));
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
