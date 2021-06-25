import {
    prefix
} from '../modules/string.js';
import el from '../modules/element.js';
import Plugin from '../modules/plugin.js';

// noinspection SpellCheckingInspection
/**
 * Link all term to Google
 *
 * @param {App} app
 * @returns {Plugin} Googlify
 */
class Googlify extends Plugin {

    /**
     * Toggle state
     * @param {Boolean} state
     * @returns {Googlify}
     */
    toggle(state) {
        super.toggle(state);
        return this.run();
    }

    listener(evt) {
        if(!evt.target.classList.contains('sb-anagram') || !evt.target.closest('.sb-anagram')){
            return false;
        }
        if(evt.button === 0) {            
           return window.open(`https://www.google.com/search?q=${evt.target.textContent}`, prefix());
        }
    }

    /**
     * Add or remove pangram underlines
     * @returns {Googlify}
     */
    run() {
        const method = `${this.getState() ? 'add' : 'remove'}EventListener`;
        [this.app.modalWrapper, this.app.resultList].forEach(container => {
            container[method]('pointerup', this.listener);
            container.classList.toggle(prefix('googlified', 'd'), this.getState());
        });
        return this;
    }


    /**
     * Googlify constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Googlify', 'Link all result terms to Google', {
            canChangeState: false
        });

        this.run();
    }
}

export default Googlify;