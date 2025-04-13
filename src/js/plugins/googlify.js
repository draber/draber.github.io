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

// noinspection SpellCheckingInspection
/**
 * Link all term to Google
 *
 * @param {App} app
 * @returns {Plugin} Googlify
 */
class Googlify extends Plugin {

    // /**
    //  * Toggle state
    //  * @param {Boolean} state
    //  * @returns {Googlify}
    //  */
    // toggle(state) {
    //     super.toggle(state);
    //     return this.run();
    // }

    /**
     * Search for term in Google
     * @param evt
     * @returns {boolean}
     */
    listener(evt) {
        if (!evt.target.classList.contains('sb-anagram') || !evt.target.closest('.sb-anagram')) {
            return false;
        }
        if (evt.button === 0) {
            window.open(`https://www.google.com/search?q=${evt.target.textContent}`, prefix());
            return true;
        }
    }

    /**
     * Add pangram underlines
     * @param evt
     * @returns {Googlify}
     */
    // eslint-disable-next-line no-unused-vars
    run(evt = null) {
        [this.app.modalWrapper, this.app.resultList.parentElement].forEach(container => {
            container.addEventListener('pointerup', this.listener);
            container.classList.add(prefix('googlified', 'd'));
        });
        return this;
    }


    /**
     * Googlify constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Googlify', 'Link all result terms to Google');

        this.run();
    }
}

export default Googlify;