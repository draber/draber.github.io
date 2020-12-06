import el from '../../modules/element.js';
import pluginManager from '../../modules/pluginManager.js';
import data from '../../modules/data.js';
import pf from '../../modules/prefixer.js';

/**
 * Spill the Beans plugin
 * 
 * @param {HTMLElement} app
 * @param {Array} args
 * @returns {HTMLElement|boolean} plugin
 */
class spillTheBeans {
    constructor(app, ...args) {

        this.app = app;
        this.args = args;
        this.title = 'Spill the beans';
        this.key = 'spillTheBeans';
        this.optional = true;

        /**
         * Watch the text input for changes
         * Partially initializes the observer, the rest is done in `observers.js` via `pluginManager.js`
         * @param target
         * @returns {{config: {childList: boolean}, observer: MutationObserver, target: HTMLElement}}
         */
        const initObserver = (target) => {
            const _observer = new MutationObserver(mutationsList => {
                // we're only interested in the very last mutation
                this.app.dispatchEvent(new CustomEvent(pf('spill'), {
                    detail: {
                        text: mutationsList.pop().target.textContent.trim()
                    }
                }));
            });
            return {
                observer: _observer,
                target: target,
                config: {
                    childList: true
                }
            }
        }

        /**
         * Check if there are still starting with the search term
         * @param {String} value
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

        // has the user has disabled the plugin?
        if (pluginManager.isEnabled(this.key, true)) {

            const pane = el.create({
                classNames: ['pane']
            });
            pane.append(el.create({
                text: 'Watch me while you type!',
                classNames: ['spill-title']
            }));
            pane.append(el.create({
                text: '😐',
                classNames: ['spill']
            }));

            this.ui = el.create({
                tag: 'details',
                text: [this.title, 'summary']
            });
            this.ui.append(pane);

            this.observer = initObserver(el.$('.sb-hive-input-content'));

            this.app.addEventListener('sbaSpill', evt => {
                reaction.textContent = react(evt.detail.text);
            });
        }
    }
}

export default spillTheBeans;