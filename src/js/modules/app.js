/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 * 
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
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

    /**
     * Set a `data` value on `<body>`
     * @param key
     * @param value
     * @returns {App}
     */
    domSet(key, value) {
        document.body.dataset[prefix(key)] = value;
        return this;
    }

    /**
     * Remove a `data` value from `<body>`
     * @param key
     * @returns {App}
     */
    domUnset(key) {
        delete document.body.dataset[prefix(key)];
        return this;
    }

    /**
     * Retrieve a `data` value from `<body>`
     * @param key
     * @returns {App}
     */
    domGet(key) {
        if (typeof document.body.dataset[prefix(key)] === 'undefined') {
            return false;
        }
        return JSON.parse(document.body.dataset[prefix(key)]);
    }

    /**
     * Retrieve observer arguments, can be used in cases where the observer needs to be interrupted
     * @returns {{options: {subtree: boolean, childList: boolean, attributes: boolean}, target: HTMLElement}}
     */
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
     * @example
     * Overview of possible states
     * 
     * splash    | .sb-game-locked | state      | action
     * ===========================================================	
     * absent    | absent          | loading    | wait for promise
     * visible   | present         | locked     | launch on click
     * hidden    | absent          | unlocked   | launch
     * 
     * @returns {Number}
     */
    getGameState() {
        const splash = el.$('#js-hook-pz-moment__welcome', this.gameWrapper);
        const contentBox = el.$('.sb-content-box', this.gameWrapper);
        if (!splash) {
            return -1; // loading
        }

        if (contentBox && contentBox.classList.contains('sb-game-locked')) {
            return 0; // locked
        }

        if (!contentBox.classList.contains('sb-game-locked')) {
            return 1; // unlocked
        }
    }

    /**
     * Retrieve sync data
     * @example 
     * On a fresh game `localStorage::sb-today` can have the following states
     * 
     * pristine:                    absent
     * at least one word locally:   loads along with splash (with tiny delay)
     * on remote entry:             no change
     * at least one word remotely:  loads along with splash (with delay)
     * 
     * @returns {Null|Array}
     */
    getSyncData() {
        let sync = localStorage.getItem('sb-today');
        if (!sync) {
            return null;
        }
        sync = JSON.parse(sync);
        if (!sync.id || sync.id !== data.getId()) {
            return null;
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
     * Retrieve existing results from other devices
     * @returns {Promise<Array>}
     */
    async getResults() {
        let tries = 20;
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
    async waitForGameState(threshold) {
        let tries = 50;
        return await new Promise(resolve => {
            const interval = setInterval(() => {
                const state = this.getGameState();
                if (!tries || this.getGameState() >= threshold) {
                    resolve(state);
                    clearInterval(interval);
                }
                tries--;
            }, 300);
        });
    }

    load() {
        if (this.isLoaded) {
            return false;
        }
        // Observe game for various changes
        this.observer = this.buildObserver();

        this.modalWrapper = el.$('.sb-modal-wrapper', this.gameWrapper);
        this.resultList = el.$('.sb-wordlist-items-pag', this.gameWrapper);
        this.waitForGameState(1)
            .then(() => {
                this.add();
                this.domSet('active', true);
                this.registerPlugins();
                this.trigger(prefix('refreshUi'));
                this.isLoaded = true;
                if (this.envIs('desktop')) {
                    window.scrollTo(0, 472);
                }
            })
    }

    /**
     * See if the app is displayed or not
     * @returns {App}
     */
    getState() {
        return this.domGet('active');
    }

    /**
     * Change app state
     * @param state
     * @returns {App}
     */
    toggle(state) {
        this.domSet('active', state);
        return this;
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

                    // 'yesterday' modal is open
                    case mutation.type === 'childList' &&
                    mutation.target.isSameNode(this.modalWrapper):
                        if (el.$('.sb-modal-frame.yesterday', mutation.target)) {
                            this.trigger(prefix('yesterday'), mutation.target);
                        }
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

    /**
     * Build the app UI
     * @returns {HTMLElement}
     */
    buildUi() {
        const events = {};
        events[prefix('destroy')] = () => {
            this.observer.disconnect();
            this.container.remove();
            this.domUnset('theme');
        };

        const classNames = [settings.get('prefix')];

        return el.div({
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
     * @returns {App}
     */
    registerPlugins() {
        this.plugins = new Map();
        Object.values(getPlugins()).forEach(plugin => {
            const instance = new plugin(this);
            instance.add();
            this.plugins.set(instance.key, instance);
        })
        this.trigger(prefix('pluginsReady'), this.plugins);
        return this;
    }

    /**
     * Add app to the DOM
     */
    add() {
        this.container.append(this.ui);
        el.$('.sb-content-box', this.gameWrapper).prepend(this.container);
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

        // App UI
        this.ui = this.buildUi();

        // init dom elements for external access
        this.container = el.div({
            classNames: [prefix('container', 'd')]
        });

        this.isLoaded = false;

        this.getResults()
            .then(results => {
                data.init(this, results);
            })
            .then(() => {
                this.waitForGameState(0)
                    .then(state => {
                        // start on button launch or automatically if the splash has already been closed (bookmarklet)
                        if (state === 0) {
                            el.$('.pz-moment__button-wrapper .pz-moment__button.primary', this.gameWrapper).addEventListener('pointerup', () => {
                                this.load();
                            })
                        } else {
                            this.load();
                        }
                    })
            })

    }
}

export default App;