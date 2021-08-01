/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 * 
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import el from '../modules/element.js';
import {
    prefix
} from '../modules/string.js';
import css from '../../css/widget.css';
import Plugin from '../modules/plugin.js';

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

        this.target = el.$('head');

        this.ui = el.style({
            content: css
        });
        app.on(prefix('destroy'), () => this.ui.remove());

        this.add();
    }
}

export default Styles;