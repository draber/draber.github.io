/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 * 
 */
import Plugin from '../modules/plugin.js';
/**
 * NYT Shortcuts Plugin
 *
 * Adds keyboard shortcuts to native NYT popups
 *
 * @param {App} app
 * @returns {Plugin} NytShortcuts
 */
class NytShortcuts extends Plugin {

    showYesterday() {
        this.triggerPopup('.pz-toolbar-button__yesterday');
    }

    showStats() {
        this.triggerPopup('.pz-toolbar-button__stats');
    }

    triggerPopup(selector) {
        document.querySelector(selector)?.click();
    }
    
    constructor(app) {
        super(app, "NYT Shortcuts", "Adds keyboard shortcuts to native NYT popups", {key: "nytShortcuts"});

        this.shortcuts = [
            { combo: 'Shift+Alt+Y', method: 'showYesterday' },
            { combo: 'Shift+Alt+S', method: 'showStats' }
        ];
    }
}

export default NytShortcuts;