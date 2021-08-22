/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import {
    prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';

/**
 * Dark Mode plugin
 *
 * @param {App} app
 * @returns {Plugin} DarkMode
 */
class DarkMode extends Plugin {

    /**
     * Toggle dark mode
     * @param state
     * @returns {DarkMode}
     */
    toggle(state) {
        super.toggle(state);
        document.body.dataset[prefix('theme')] = state ? 'dark' : 'light';
        return this;
    }

    /**
     * DarkMode constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Dark Mode', 'Applies a dark theme to this page', {
            canChangeState: true,
            defaultState: false
        });

        // toggle body dataset
        this.toggle(this.getState());
    }
}

export default DarkMode;