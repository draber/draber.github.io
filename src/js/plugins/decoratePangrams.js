import {
    prefix
} from '../modules/string.js';
import el from '../modules/element.js';
import Plugin from '../modules/plugin.js';
import data from '../modules/data.js';

/**
 * Dark Mode plugin
 *
 * @param {App} app
 * @returns {Plugin} DecoratePangrams
 */
class DecoratePangrams extends Plugin {

    decorate() {
        const pangrams = data.getList('pangrams');
        this.resultItems.forEach(node => {
            const term = node.textContent;
            if (pangrams.includes(term)) {
                node.classList.add('sb-pangram');
            }
        });
    }

    constructor(app) {

        super(app, 'Underline Pangrams');

        this.resultItems = el.$$('li', app.resultList);

        app.on(prefix('wordsUpdated'), () => {
            this.decorate();
        })

        this.decorate();
        this.add();
    }
}

export default DecoratePangrams;