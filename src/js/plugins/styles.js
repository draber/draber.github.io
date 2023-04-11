/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import {
    prefix
} from '../modules/string.js';
import css from '../assets/app.css';
import Plugin from '../modules/plugin.js';
import fn from 'fancy-node';

/**
 * Styles plugin
 *
 * @param {App} app
 * @returns {Plugin} Styles
 */
class Styles extends Plugin {

    /**
     * Styles constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Styles', '');

        this.target = fn.$('head');

        this.ui = fn.style({
            content: css
        });
        app.on(prefix('destroy'), () => this.ui.remove());
    }
}

export default Styles;