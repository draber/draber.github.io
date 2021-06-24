import el from '../modules/element.js';
import data from '../modules/data.js';
import {
    prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';

/**
 * Spill the beans plugin
 * 
 * @param {App} app
 * @returns {Plugin} SpillTheBeans
 */
class SpillTheBeans extends Plugin {

    /**
     * Check if the input matches a term in the remainder list
     * @param {Event} evt
     */
    run(evt) {
        let emoji = '🙂';
        if (!evt.detail) {
            emoji = '😐';
        }
        else if (!data.getList('remainders').filter(term => term.startsWith(evt.detail)).length) {
            emoji = '🙁';
        }
        this.ui.textContent = emoji;
    }

    /**
     * SpillTheBeans constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Spill the beans', 'An emoji that shows if the last letter was right or wrong', {
            canChangeState: true,
            runEvt: prefix('newInput'),
            addMethod: 'prepend'
        });

        /**
         * Emoji area
         */
        this.ui = el.div({
            content: '😐'
        });

        this.target = el.$('.sb-controls', this.app.gameWrapper);

		this.toggle(false);

    }
}

export default SpillTheBeans;
