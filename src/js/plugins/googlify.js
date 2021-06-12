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

    /**
     * Add or remove pangram underlines
     * @returns {Googlify}
     */
    run() {
        const args = this.app.getObserverArgs();
        this.app.observer.disconnect();
        const fn = this.getState() ? this.link : this.unlink;
        el.$$('li', this.app.resultList).forEach(node => {
            fn(node);
        });
        this.app.observer.observe(args.target, args.options);
        return this;
    }

    /**
     * Add link to a node
     * @param {HTMLElement} node
     */
    link(node){
        if (el.$('a', node)) {
            return false;
        }
        node.append(el.a({
            content: node.firstChild,
            attributes: {
                href: `https://www.google.com/search?q=${encodeURI(node.textContent)}`,
                target: 'google'
            }
        }));
    }

    /**
     * Remove link from a node
     * @param {HTMLElement} node
     */
    unlink(node) {
        const link = el.$('a', node);
        if (!link) {
            return false;
        }
        const original = link.firstChild.cloneNode(true);
        node = el.empty(node);
        node.append(original);
    }

    /**
     * Googlify constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Googlify', 'Link all result terms to Google', {
            canChangeState: true,
			runEvt: prefix('refreshUi')
        });

        this.run();
    }
}

export default Googlify;