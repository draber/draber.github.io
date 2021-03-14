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
        this.handleDecoration();
        return this;
    }

    /**
     * Add or remove pangram underlines
     * @returns {HighlightPangrams}
     */
    handleDecoration() {
        const pangrams = data.getList('pangrams');
        el.$$('li', this.app.resultList).forEach(node => {
            const term = node.textContent;
            if (pangrams.includes(term)) {
                node.classList.toggle(prefix('pangram', 'd'), this.getState());
            }
        });
        return this;
    }

    constructor(app) {

        super(app, 'Highlight pangrams', 'Highlights pangrams in the result list', {
            canChangeState: true
        });

        app.on(prefix('wordsUpdated'), () => {
            this.handleDecoration();
        })

        this.handleDecoration();
        this.add();
    }
}

export default HighlightPangrams;