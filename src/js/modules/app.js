import el from './element.js';
import settings from './settings.js';
import data from './data.js';
import Widget from './widget.js';
import {
    prefix
} from './string.js';


// noinspection JSUnresolvedVariable
/**
 * App container
 * @param {HTMLElement} game
 * @returns {App} app
 */
class App extends Widget {

    /**
     * Show/Hide UI
     */
    toggleVisibility() {
        this.ui.classList.toggle('hidden');
    }

    /**
     * Retrieve sync data
     * @returns {Boolean|Array}
     */
    getSyncData() {
        let sync = localStorage.getItem('sb-today');
        if (!sync) {
            return false;
        }
        sync = JSON.parse(sync);
        if (!sync.id || sync.id !== data.getId()) {
            return false;
        }
        return sync.words || [];
    }

    /**
     * Retrieve existing results
     * @returns {Promise<Array>}
     */
    async getResults() {
        let syncResults;
        let tries = 5;
        return await new Promise(resolve => {
            const interval = setInterval(() => {
                syncResults = this.getSyncData();
                if (syncResults || !tries) {
                    resolve(syncResults || []);
                    clearInterval(interval);
                }
                tries--;
            }, 300);
        });
    }

    /**
     * Register all plugins
     * @param plugins
     * @returns {Widget}
     */
    registerPlugins(plugins) {
        for (const [key, plugin] of Object.entries(plugins)) {
            this.registry.set(key, new plugin(this));
        }
        this.trigger(prefix('pluginsReady'), this.registry);
        return this.registerTools();
    }

    /**
     * Register tools for tool bar
     * @returns {Widget}
     */
    registerTools() {
        this.registry.forEach(plugin => {
            if (plugin.tool) {
                this.toolButtons.set(plugin.key, plugin.tool);
            }
        })
        this.enableTool('arrowDown', 'Maximize assistant', 'Minimize assistant');
        this.tool.classList.add('minimizer');
        this.toolButtons.set(this.key, this.tool);
        return this.trigger(prefix('toolsReady'), this.toolButtons);
    }

    /**
     * Builds the app
     * @param {HTMLElement} game
     */
    constructor(game) {

        super(settings.get('label'), {
            canChangeState: true,
            key: prefix('app'),
        });
        this.game = game;

        const oldInstance = el.$(`[data-id="${this.key}"]`);
        if (oldInstance) {
            oldInstance.dispatchEvent(new Event(prefix('destroy')));
        }

        this.registry = new Map();
        this.toolButtons = new Map();

        this.parent = el.div({
            classNames: [prefix('container')]
        });

        this.resultList = el.$('.sb-wordlist-items-pag', game);
        
        const events = {};
        events[prefix('destroy')] = () => {
            this.observer.disconnect();
            this.parent.remove();
            delete document.body.dataset[prefix('theme')];
        };

        this.isDraggable = document.body.classList.contains('pz-desktop');

        this.ui = el.div({
            attributes: {
                draggable: this.isDraggable
            },
            data: {
                id: this.key,
                version: settings.get('version')
            },
            classNames: [settings.get('prefix')],
            events: events
        });

        /**
         * The element that is used to drag the app
         * @type {HTMLElement}
         */
        this.dragHandle = this.ui;

        /**
         * The area in which the app can be dragged
         * @type {HTMLElement}
         */
        this.dragArea = this.game;

        /**
         * The offset from the borders of the drag area in px
         * @type {int|{top: int, right: int, bottom: int, left: int}}
         */
        this.dragOffset = 12;

        this.observer = (() => {
            const observer = new MutationObserver(mutationList => {
                mutationList.forEach(mutation => {
                    if (mutation.type === 'childList'
                        && mutation.target instanceof HTMLElement) {
                        switch (true) {

                            // text input
                            case mutation.target.classList.contains('sb-hive-input-content')
                                && !!mutation.target.textContent.trim():
                                this.trigger(prefix('newInput'), mutation.target.textContent.trim());
                                break;

                            // term added to word list
                            case mutation.target.isSameNode(this.resultList)
                                && !!mutation.addedNodes.length
                                && !!mutation.addedNodes[0].textContent.trim()
                                && mutation.addedNodes[0] instanceof HTMLElement:
                                this.trigger(prefix('newWord'), mutation.addedNodes[0].textContent.trim());
                                break;
                        }
                    }
                });
            });
            observer.observe(this.game, {
                childList: true,
                subtree: true
            });
            return observer;
        })();

        // minimize on smaller screens
        const mql = window.matchMedia('(max-width: 1196px)');
        mql.addEventListener('change', evt => this.toggle(!evt.currentTarget.matches));
        mql.dispatchEvent(new Event('change'));

        const wordlistToggle = el.$('.sb-toggle-expand');
        wordlistToggle.addEventListener('click', () => {
            this.ui.style.display = el.$('.sb-toggle-icon-expanded', wordlistToggle) ? 'none' : 'block';
        })
        if (el.$('.sb-toggle-icon-expanded', wordlistToggle)) {
            wordlistToggle.dispatchEvent(new Event('click'));
        }

        this.parent.append(this.ui);
        this.game.before(this.parent);
        document.body.dataset[prefix('theme')] = 'light';

        this.toggle(this.getState());
    }
}

export default App;
