import el from '../modules/element.js';
import data from '../modules/data.js';
import Plugin from '../modules/plugin.js';

/**
 * Spill the beans plugin
 * 
 * @param {App} app
 * @returns {Plugin} SpillTheBeans
 */
class SpillTheBeans extends Plugin {
    constructor(app) {

        super(app, 'Spill the beans', {
            canDeactivate: true
        });

        /**
         * Check per letter the typed letters still fit a word in the remainder list
         * @param {String} value
         * @returns {string}
         */
        const react = (value) => {
            if (!value) {
                return '😐';
            }
            if (!data.getList('remainders').filter(term => term.startsWith(value)).length) {
                return '🙁';
            }
            return '🙂';
        }

        this.ui = el.details();
        
        const pane = el.div({
            classNames: ['pane']
        });
        pane.append(el.div({
            text: 'Watch me while you type!',
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

        (new MutationObserver(mutationsList => {
            reaction.textContent = react(mutationsList.pop().target.textContent.trim());
        })).observe(el.$('.sb-hive-input-content', app.game), {
            childList: true
        });

        this.add();
    }
}

export default SpillTheBeans;
