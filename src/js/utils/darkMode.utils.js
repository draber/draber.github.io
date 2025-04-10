/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

import settings from "../modules/settings.js";

export const utils = (self) => ({
    /**
     * "Dark Mode" in self context means a mode implemented by parties other than the Spelling Bee Assistant.
     * @returns {boolean} - True if the dark mode is enabled, false otherwise.
     */
    usesNonSbaDarkMode() {
        const rgb = getComputedStyle(document.body).backgroundColor.match(/\d+/g);

        if (!rgb || (rgb.length === 4 && parseInt(rgb[3]) === 0)) {
            return false; // fallback: assume light mode
        }
        const [r, g, b] = rgb.map(Number);

        const toLinear = (v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        };

        const [R, G, B] = [r, g, b].map(toLinear);
        const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;

        return luminance < 0.5;
    },

    /**
     * This function checks if the dark mode is enabled by SBA.
     * The default hsl values for black and white are 0, 0, 0 and 0, 0, 100 respectively.
     * Any lightness value below 50 indicates a dark mode.
     * @returns {boolean} - True if the dark mode is enabled, false otherwise.
     */
    usesSbaDarkMode() {
        return self.getModeFromHsl(self.getColorParameters()) === "dark";
    },

    /**
     * This function checks the user's system settings for dark mode.
     * @returns {boolean} - True if the system dark mode is enabled, false otherwise.
     */
    usesSystemDarkMode() {
        const darkMode = window.matchMedia("(prefers-color-scheme: dark)");
        return !!darkMode.matches;
    },

    /**
     * Compare two HSL objects for equality.
     * @param {Object} {{ hue: number, sat: number, lig: number }} hslObj1 
     * @param {Object} {{ hue: number, sat: number, lig: number }} hslObj2 
     * @returns 
     */
    hslObjsAreEqual(hslObj1, hslObj2) {
        return (
            hslObj1.hue === hslObj2.hue &&
            hslObj1.sat === hslObj2.sat &&
            hslObj1.lig === hslObj2.lig
        );
    },

    /**
     * Get the defaults for the HSL color model based on the mode.
     * @param {string} mode
     * @returns
     */
    getHslDefaults(mode) {
        return {
            hue: 0,
            sat: 0,
            lig: mode === "dark" ? 0 : 100,
        };
    },

    /**
     * Get the mode based on the lightness value of the HSL object.
     * @param {Object} hslObj
     * @returns
     */
    getModeFromHsl(hslObj) {
        return hslObj.lig < 50 ? "dark" : "light";
    },

    /**
     * Retrieves the currently stored hue and saturation parameters from settings.
     * @param {string} mode - The mode for which to get the defaults (default is "light").
     * @returns {{ hue: number, sat: number, lig: number }} The current color parameters as hslObj.
     */
    getColorParameters(mode="light") {
        const defaults = self.getHslDefaults(mode);
        if(mode === "light") {
            return defaults;
        }
        const {
            hue = defaults.hue,
            sat = defaults.sat,
            lig = defaults.lig,
        } = settings.get(`options.${self.key}`) || {};
        return { hue, sat, lig };
    },
});
