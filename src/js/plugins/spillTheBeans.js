import el from '../modules/element.js';
import data from '../modules/data.js';
import {
    prefix
} from '../modules/string.js';
import DisclosureBox from './disclosureBox.js';

/**
 * Spill the beans plugin
 * 
 * @param {App} app
 * @returns {Plugin} SpillTheBeans
 */
class SpillTheBeans extends DisclosureBox {

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
        this.reaction.textContent = emoji;
    }

    /**
     * SpillTheBeans constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Spill the beans', 'An emoji that shows if the last letter was right or wrong', {
            canChangeState: true,
            runEvt: prefix('newInput')
        });

        /**
         * Emoji area
         */
        this.reaction = el.div({
            content: '😐',
            classNames: ['spill']
        });

        this.pane = el.div({
            classNames: ['pane'],
            content: [
                el.div({
                    content: 'Watch my reaction!',
                    classNames: ['spill-title']
                }),
                this.reaction
            ]
        });
    }
}

export default SpillTheBeans;
