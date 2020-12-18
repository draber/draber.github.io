import el from './element.js';
import settings from './settings.js';
import data from './data.js';
import widget from './widget.js';
import {
    prefix
} from './string.js';


/**
 * App container
 * @param {HTMLElement} game
 * @returns {app} app
 */
class app extends widget {
    constructor(game) {
        if (!game || !window.gameData) {
            console.info(`This bookmarklet only works on ${settings.get('targetUrl')}`);
            return false;
        }

        super(settings.get('label'));
        this.game = game;

        const oldInstance = el.$(`[data-id="${this.key}"]`);
        if (oldInstance) {
            oldInstance.dispatchEvent(new Event(prefix('destroy')));
        }

        this.registry = new Map();

        const rect = el.$('.sb-content-box', game).getBoundingClientRect();

        const resultList = el.$('.sb-wordlist-items', game);
        const events = {};
        events[prefix('destroy')] = () => {
            this.observer.disconnect();
            this.ui.remove();
        };
        this.ui = el.div({
            attributes: {
                draggable: true
            },
            style: {
                left: (rect.right + 10) + 'px',
                top: (rect.top + window.pageYOffset) + 'px',
            },
            data: {
                id: this.key
            },
            classNames: [settings.get('prefix')],
            events: events
        });

        data.init(this, resultList);

        this.observer = new MutationObserver(() =>  this.trigger(new Event(prefix('newWord'))));

        this.observer.observe(resultList, {
            childList: true
        });

        this.registerPlugins = (plugins) => {
            for (const [key, plugin] of Object.entries(plugins)) {
                this.registry.set(key, new plugin(this));
            }
        }

        this.toggle = () => this.ui.classList.toggle('minimized');

        el.$('body').append(this.ui);
    };
}

export default app;
