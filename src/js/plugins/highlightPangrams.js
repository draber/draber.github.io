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
 * @returns {Plugin} HighlightPangrams
 */
class HighlightPangrams extends Plugin {

    /**
     * Toggle state
     * @param state
     * @returns {HighlightPangrams}
     */
    toggle(state) {
        super.toggle(state);
        return this.run();
    }

    /**
     * Add or remove pangram underlines
     * @param {Event} evt
     * @returns {HighlightPangrams}
     */
    // eslint-disable-next-line no-unused-vars
    run(evt) {
        const args = this.app.getObserverArgs();
        this.app.observer.disconnect();
        const pangrams = data.getList('pangrams');
        el.$$('li', this.app.resultList).forEach(node => {
            const term = node.textContent;
            if (pangrams.includes(term)) {
                node.classList.toggle(this.marker, this.getState());
            }
        });
        this.app.observer.observe(args.target, args.options);
        return this;
    }

    /**
     * HighlightPangrams constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Highlight pangrams', 'Highlights pangrams in the result list', {
            canChangeState: true,
			runEvt: prefix('refreshUi')
        });

        this.marker = prefix('pangram', 'd');

        this.run();
    }
}

export default HighlightPangrams;