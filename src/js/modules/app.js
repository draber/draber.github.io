import el from './element.js';
import settings from './settings.js';
import data from './data.js';
import getPlugins from './importer.js';
import Widget from './widget.js';
import {
    prefix
} from './string.js';

/**
 * App container
 * @param {HTMLElement} game
 * @returns {App} app
 */
class App extends Widget {

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
     * Retrieve environment
     * @param {String} env desktop|mobile
     * @returns {Boolean}
     */
    envIs(env) {
        return document.body.classList.contains('pz-' + env);
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
     * Wait for the game to be fully displayed
     * @returns {Promise<Boolean>}
     */
    async waitForFadeIn() {
        let tries = 5;
        return await new Promise(resolve => {
            const interval = setInterval(() => {
                const gameHook = el.$('#js-hook-pz-moment__game');
                if (!tries || (gameHook && !gameHook.classList.contains('on-stage'))) {
                    resolve(true);
                    clearInterval(interval);
                }
                tries--;
            }, 300);
        });
    }

    /**
     * Register all plugins
     * @returns {Widget}
     */
    registerPlugins() {
        Object.values(getPlugins(this)).forEach(plugin => {
            const instance = new plugin(this);
            this.plugins.set(instance.key, instance);
        })
        this.trigger(prefix('pluginsReady'), this.plugins);
        return this.registerTools();
    }

    /**
     * Register tools for tool bar
     * @returns {Widget}
     */
    registerTools() {
        this.plugins.forEach(plugin => {
            if (plugin.tool) {
                this.toolButtons.set(plugin.key, plugin.tool);
            }
        })
        return this.trigger(prefix('toolsReady'), this.toolButtons);
    }

    /**
     * Builds the app
     * @param {HTMLElement} gameWrapper
     */
    constructor(gameWrapper) {

        super(settings.get('label'), {
            canChangeState: true,
            key: prefix('app'),
        });

        // Kill existing instance could happen on conflict between bookmarklet and extension
        const oldInstance = el.$(`[data-id="${this.key}"]`);
        if (oldInstance) {
            oldInstance.dispatchEvent(new Event(prefix('destroy')));
        }

        // plugins and toolbar
        this.plugins = new Map();
        this.toolButtons = new Map();

        // DOM containers
        this.gameWrapper = gameWrapper;
        this.modalWrapper = el.$('.sb-modal-wrapper', this.gameWrapper);
        this.resultList = el.$('.sb-wordlist-items-pag', gameWrapper);
        this.container = el.div({
            classNames: [prefix('container')]
        });

        // App UI
        const events = {};
        events[prefix('destroy')] = () => {
            this.observer.disconnect();
            this.container.remove();
            delete document.body.dataset[prefix('theme')];
        };

        const classNames = [settings.get('prefix')];
        if (this.getState() === false) {
            classNames.push('inactive');
        }

        this.ui = el.div({
            attributes: {
                draggable: this.envIs('desktop')
            },
            data: {
                id: this.key,
                version: settings.get('version')
            },
            classNames,
            events: events
        });

        // Drag related
        this.dragHandle = this.ui;
        this.dragArea = this.gameWrapper;

        /**
         * The offset from the borders of the drag area in px
         * @type {int|{top: int, right: int, bottom: int, left: int}}
         */
        this.dragOffset = {
            top: 69,
            right: 12,
            bottom: 12,
            left: 12
        };

        // Observe game for various changes
        this.observer = (() => {
            const observer = new MutationObserver(mutationList => {
                mutationList.forEach(mutation => {
                    if (!(mutation.target instanceof HTMLElement)) {
                        return false;
                    }
                    switch (true) {

                        // result list toggles open
                        case mutation.type === 'attributes' &&
                        mutation.target.classList.contains('sb-content-box'):
                            document.body.dataset[prefix('hasOverlay')] = mutation.target.classList.contains('sb-expanded');
                            break;

                            // modal is open
                        case mutation.type === 'childList' &&
                        mutation.target.isSameNode(this.modalWrapper):
                            document.body.dataset[prefix('hasOverlay')] = !!mutation.target.hasChildNodes();
                            break;

                            // text input
                        case mutation.type === 'childList' &&
                        mutation.target.classList.contains('sb-hive-input-content'):
                            this.trigger(prefix('newInput'), mutation.target.textContent.trim());
                            break;

                            // term added to word list
                        case mutation.type === 'childList' &&
                        mutation.target.isSameNode(this.resultList) &&
                        !!mutation.addedNodes.length &&
                        !!mutation.addedNodes[0].textContent.trim() &&
                        mutation.addedNodes[0] instanceof HTMLElement:
                            this.trigger(prefix('newWord'), mutation.addedNodes[0].textContent.trim());
                            break;
                    }
                });
            });
            observer.observe(this.gameWrapper, {
                childList: true,
                subtree: true,
                attributes: true
            });
            return observer;
        })();

        Promise.all([this.getResults(), this.waitForFadeIn()])
            .then(values => {
                data.init(this, values[0]);
                this.container.append(this.ui);
                this.gameWrapper.before(this.container);
                this.gameWrapper.dataset.sbaActive = this.getState();
                this.registerPlugins();
                this.trigger(prefix('wordsUpdated'));
            });
    }
}

export default App;
