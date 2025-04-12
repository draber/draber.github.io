/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

import settings from "../modules/settings.js";
import { isEmptyObject } from "../utils/utils.js";

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
     * @returns {boolean} - True if the dark mode is enabled, false otherwise.
     */
    usesSbaDarkMode() {
        return self.getStoredColorScheme().mode === "dark";
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
     * Compares two color config objects for equality.
     *
     * @param {Object} {{mode: 'light' | 'dark', hsl: {hue: number, sat: number, lig: number}}} a
     * @param {Object} {{mode: 'light' | 'dark', hsl: {hue: number, sat: number, lig: number}}} b
     * @returns {boolean} True if both objects are equal, false otherwise.
     */
    colorObjectsAreEqual(a, b) {
        return a.mode === b.mode && a.hsl.hue === b.hsl.hue && a.hsl.sat === b.hsl.sat && a.hsl.lig === b.hsl.lig;
    },

    /**
     * Retrieve the current configuration of the color mode
     * @returns {Object} {{ mode: 'light' | 'dark', hsl: { hue: number, sat: number, lig: number }}}
     */
    getStoredColorScheme() {
        let scheme = settings.get(`options.${self.key}`);
        if (self.isInvalidScheme(scheme)) {
            return {
                mode: "light",
                // @see _colors.scss [data-sba-theme] --dhue, --dsat and --dlig
                hsl: {
                    hue: 0,
                    sat: 0,
                    lig: 7,
                },
            };
        } else {
            // ignore keys such as shortcuts
            return {
                mode: scheme.mode,
                hsl: scheme.hsl,
            };
        }
    },

    /**
     * Turn scheme into a hsl string for CSS
     * @param {Object} scheme 
     * @returns {String}
     */
    cssHslFromColorScheme(scheme) {
        return `hsl(${scheme.hsl.hue}, ${scheme.hsl.sat}%, ${scheme.hsl.lig}%)`;
    },

    /**
     * Check if a scheme is what it's meant to be
     * @param {{mode: string, hsl: Object}|null} scheme
     * @returns 
     */
    isInvalidScheme(scheme = null) {
        return !scheme || isEmptyObject(scheme) || !scheme.hsl || isEmptyObject(scheme.hsl) || !scheme.mode;
    },
});
