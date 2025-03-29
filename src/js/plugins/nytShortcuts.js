/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 *
 */
import { getPopupCloser, manualDelete } from "../modules/helpers.js";
import Plugin from "../modules/plugin.js";
import fn from "fancy-node";
/**
 * NYT Shortcuts Plugin
 *
 * Adds keyboard shortcuts to native NYT popups
 *
 * @param {App} app
 * @returns {Plugin} NytShortcuts
 */
class NytShortcuts extends Plugin {

    
    toggleYesterday() {
        this.triggerPopup(".pz-toolbar-button__yesterday");
    }

    toggleStats() {
        this.triggerPopup(".pz-toolbar-button__stats");
    }

    /**
     * Triggers a popup by attempting to close any active modal first, then clicking the provided selector.
     *
     * If a modal closer is found, it will click it and use a `setTimeout` to manually delete
     * the last letter from the input field (as a workaround for NYT's DOM timing issues).
     * Otherwise, it simply clicks the target element directly.
     *
     * @param {string} selector - A CSS selector string pointing to the element to click after closing the modal.
     *
     * @todo Replace `setTimeout(manualDelete, 50)` with a more robust event-driven solution or DOM observer.
     */
    triggerPopup(selector) {
        let popupCloser = getPopupCloser(this.app);
        if (popupCloser) {
            setTimeout(manualDelete, 50);
            popupCloser.click();
        } else {
            fn.$(selector)?.click();
        }
    }

    constructor(app) {
        super(app, "NYT Shortcuts", "Adds keyboard shortcuts to native NYT popups", { key: "nytShortcuts" });

        this.selectors = {
            yesterdaysAnswers: ".pz-toolbar-button__yesterday",
            statistics: ".pz-toolbar-button__stats",
        };

        this.shortcuts = [
            { combo: "Shift+Alt+Y", method: "toggleYesterday", label: `Yesterday's Answers` },
            { combo: "Shift+Alt+I", method: "toggleStats", label: `Statistics` },
        ].map((shortcut) => ({ ...shortcut, origin: "nyt" }));
    }
}

export default NytShortcuts;
