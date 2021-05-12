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

        super(app, 'Spill the beans', 'Emoji that shows if your last letter was right or wrong', {
            canChangeState: true
        });

        this.ui = el.details();

        const pane = el.div({
            classNames: ['pane']
        });
        pane.append(el.div({
            text: 'Watch my reaction!',
            classNames: ['spill-title']
        }));
        const reaction = el.div({
            text: '😐',
            classNames: ['spill']
        });
        pane.append(reaction);
        this.ui.append(el.summary({
            text: this.title
        }), pane);        

        this.app.on(prefix('newInput'), evt => {
            reaction.textContent = this.react(evt.detail);
        })

        this.add();
    }
}

export default SpillTheBeans;