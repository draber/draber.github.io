import el from '../modules/element.js';
import data from '../modules/data.js';
import Plugin from '../modules/plugin.js';
import {
    prefix
} from '../modules/string.js';

/**
 * Spill the beans plugin
 * 
 * @param {App} app
 * @returns {Plugin} SpillTheBeans
 */
class SpillTheBeans extends Plugin {

    /**
     * Check if the input matches a term in the remainder list
     * @param {String} value
     * @returns {string}
     */
    react(value) {
        if (!value) {
            return '😐';
        }
        if (!data.getList('remainders').filter(term => term.startsWith(value)).length) {
            return '🙁';
        }
        return '🙂';
    }

    constructor(app) {

        super(app, 'Spill the beans', 'An emoji that shows if the last letter was right or wrong', {
            canChangeState: true
        });

        /**
         * Emoji area
         */
        const reaction = el.div({
            text: '😐',
            classNames: ['spill']
        });

        this.ui = el.details({
            html: [el.summary({
                text: this.title
            }), el.div({
                classNames: ['pane'],
                html: [
                    el.div({
                        text: 'Watch my reaction!',
                        classNames: ['spill-title']
                    }),
                    reaction
                ]
            })]
        });

        this.app.on(prefix('newInput'), evt => {
            reaction.textContent = this.react(evt.detail);
        })

        this.add();
    }
}

export default SpillTheBeans;