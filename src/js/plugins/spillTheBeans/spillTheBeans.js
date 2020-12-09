import el from '../../modules/element.js';
import data from '../../modules/data.js';
import plugin from '../../modules/pluginBase.js';
import {
	camel
} from '../../modules/string.js';

/**
 * Spill the beans plugin
 * 
 * @param {app} app
 * @returns {plugin} spillTheBeans
 */
class spillTheBeans extends plugin {
    constructor(app) {

        super(app);
        this.title = 'Spill the beans';
        this.key = camel(this.title);
        this.optional = true;

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

        this.ui = el.create({
            tag: 'details',
            text: [this.title, 'summary'],
            classNames: !this.isEnabled() ? ['inactive'] : []
        });
        const pane = el.create({
            classNames: ['pane']
        });
        pane.append(el.create({
            text: 'Watch me while you type!',
            classNames: ['spill-title']
        }));
        const reaction = el.create({
            text: '😐',
            classNames: ['spill']
        });
        pane.append(reaction);
        this.ui.append(pane);

        (new MutationObserver(mutationsList => {
            reaction.textContent = react(mutationsList.pop().target.textContent.trim());
        })).observe(el.$('.sb-hive-input-content', app.game), {
            childList: true
        });

        this.add();
    }
}

export default spillTheBeans;
