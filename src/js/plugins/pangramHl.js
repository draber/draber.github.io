/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import {
    prefix
} from '../utils/string.js';
import Plugin from '../modules/plugin.js';
import data from '../modules/data.js';
import fn from 'fancy-node';

/**
 * Pangram Highlight plugin
 *
 * @param {App} app
 * @returns {Plugin} PangramHl
 */
class PangramHl extends Plugin {

    /**
     * Toggle state
     * @param state
     * @returns {PangramHl}
     */
    toggle(state) {
        super.toggle(state);
        return this.run();
    }

    /**
     * Add or remove pangram underlines
     * @param {Event} evt
     * @returns {PangramHl}
     */
    // eslint-disable-next-line no-unused-vars
    run(evt) {
        const pangrams = data.getList('pangrams');
        const container = evt && evt.detail ? evt.detail : this.app.resultList;
        fn.$$('li', container).forEach(node => {
            const term = node.textContent;
            if (pangrams.includes(term) || fn.$('.pangram', node)) {
                node.classList.toggle(this.marker, this.getState());
            }
        });
        return this;
    }

    /**
     * PangramHl constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Highlight PangramHl', '', {
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

export default PangramHl;