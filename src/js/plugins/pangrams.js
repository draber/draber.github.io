/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 * 
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import {
    prefix
} from '../modules/string.js';
import el from '../modules/element.js';
import Plugin from '../modules/plugin.js';
import data from '../modules/data.js';

/**
 * Highlight Pangrams plugin
 *
 * @param {App} app
 * @returns {Plugin} Pangrams
 */
class Pangrams extends Plugin {

    /**
     * Toggle state
     * @param state
     * @returns {Pangrams}
     */
    toggle(state) {
        super.toggle(state);
        return this.run();
    }

    /**
     * Add or remove pangram underlines
     * @param {Event} evt
     * @returns {Pangrams}
     */
    // eslint-disable-next-line no-unused-vars
    run(evt) {
        const pangrams = data.getList('pangrams');
        const container = evt && evt.detail ? evt.detail : this.app.resultList;
        el.$$('li', container).forEach(node => {
            const term = node.textContent;
            if (pangrams.includes(term) || el.$('.pangram', node)) {
                node.classList.toggle(this.marker, this.getState());
            }
        });
        return this;
    }

    /**
     * Pangrams constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Highlight Pangrams', '', {
            canChangeState: false,
            runEvt: prefix('refreshUi')
        });

        this.marker = prefix('pangram', 'd');

        this.app.on(prefix('yesterday'), evt => {
            this.run(evt);
        })

        this.run();
    }
}

export default Pangrams;