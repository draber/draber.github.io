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
 * @param {HTMLElement} gameWrapper
 * @returns {App} app
 */
class App extends Widget {

    getObserverArgs() {
        return {
            target: this.gameWrapper,
            options: {
                childList: true,
                subtree: true,
                attributes: true
            }
        }
    }

    /**
     * Whether the splash screen has gone and the content box isn't set to `sb-game-locked`
     * @returns {Boolean}
     */
    gameIsUnlocked() {
        const splash = el.$('#js-hook-pz-moment__welcome', this.gameWrapper);
        const contentBox = el.$('.sb-content-box', this.gameWrapper);
        return splash && contentBox && !contentBox.classList.contains('sb-game-locked');
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
        let tries = 50;
        return await new Promise(resolve => {
            const interval = setInterval(() => {
                const syncResults = this.getSyncData();
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
    async waitForUnlock() {
        let tries = 200;
        return await new Promise(resolve => {
            const interval = setInterval(() => {
                if (!tries || this.gameIsUnlocked()) {
                    resolve(true);
                    clearInterval(interval);
                }
                tries--;
            }, 300);
        });
    }

    /**
     * Observe game for various changes
     * @returns {MutationObserver}
     */
    buildObserver() {
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
        const args = this.getObserverArgs();
        observer.observe(args.target, args.options);
        return observer;
    } 

    setDragProps() {

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
    }

    buildUi() {
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

        return el.div({
            attributes: {
                draggable: this.envIs('desktop')
            },
            data: {
                id: this.key,
                version: settings.get('version')
            },
            classNames,
            events
        });
    }

    /**
     * Register all plugins
     * @returns {Widget}
     */
    registerPlugins() {
        this.plugins = new Map();
        Object.values(getPlugins(this)).forEach(plugin => {
            const instance = new plugin(this);
            instance.add();
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
        this.toolButtons = new Map();
        this.plugins.forEach(plugin => {
            if (plugin.tool) {
                this.toolButtons.set(plugin.key, plugin.tool);
            }
        })
        return this.trigger(prefix('toolsReady'), this.toolButtons);
    }

    add() {
        this.container.append(this.ui);
        if (this.envIs('mobile')) {
            el.$('.sb-controls-box', this.gameWrapper).append(this.container);
        } else {
            this.gameWrapper.before(this.container);
        }
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

        // Kill existing instance - this could happen on a conflict between bookmarklet and extension
        // or while debugging
        const oldInstance = el.$(`[data-id="${this.key}"]`);
        if (oldInstance) {
            oldInstance.dispatchEvent(new Event(prefix('destroy')));
        }

        // Outer container
        this.gameWrapper = gameWrapper;

        Promise.all([this.getResults(), this.waitForUnlock()])
            .then(values => {

                // App UI
                this.ui = this.buildUi();
                this.setDragProps();

                // Observe game for various changes
                this.observer = this.buildObserver();

                // init dom elements for external access
                this.container = el.div({
                    classNames: [prefix('container')]
                });
                this.modalWrapper = el.$('.sb-modal-wrapper', this.gameWrapper);
                this.resultList = el.$('.sb-wordlist-items-pag', this.gameWrapper);

                data.init(this, values[0]);
                this.add();
                this.gameWrapper.dataset.sbaActive = this.getState();
                this.registerPlugins();
                this.trigger(prefix('refreshUi'));
            });
    }
}

export default App;