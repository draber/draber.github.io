/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 * 
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import el from '../modules/element.js';
import settings from '../modules/settings.js';
import Plugin from '../modules/plugin.js';

/**
 * Header plugin
 * 
 * @param {App} app
 * @returns {Plugin} Header
 */
class Header extends Plugin {

    /**
     * Header constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, settings.get('title'), '', {
            key: 'header'
        });

        this.ui = el.div({
            content: this.title
        });

    }
}

export default Header;