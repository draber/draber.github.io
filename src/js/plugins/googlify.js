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
     * Link all terms in the game to Google: result list, SBA pop-ups and NYT modals such as Yesterday's Answers.
     * NYT modals are rendered on demand, so the listener sits on the static game wrapper (event delegation).
     * Capture phase, so the NYT's own handlers can't stop the event first.
     * @see https://github.com/draber/draber.github.io/issues/201
     * @param evt
     * @returns {Googlify}
     */
    // eslint-disable-next-line no-unused-vars
    run(evt = null) {
        const container = this.app.gameWrapper;
        container.addEventListener('pointerup', this.listener, true);
        container.classList.add(prefix('googlified', 'd'));
        return this;
    }

    /**
     * Googlify constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Googlify', 'Link all result terms to Google');

        this.app.on(prefix('destroy'), () => {
            this.app.gameWrapper.removeEventListener('pointerup', this.listener, true);
            this.app.gameWrapper.classList.remove(prefix('googlified', 'd'));
        });

        this.run();
    }
}

export default Googlify;