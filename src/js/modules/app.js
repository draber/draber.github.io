/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import settings from "./settings.js";
import data from "./data.js";
import getPlugins from "./importer.js";
import Widget from "./widget.js";
import { prefix } from "./string.js";
import fn from "fancy-node";

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
        if (typeof document.body.dataset[prefix(key)] === "undefined") {
            return false;
        }
        return JSON.parse(document.body.dataset[prefix(key)]);
    }

    /**
     * Retrieve sync data from local storage
     * @returns {Array}
     */
    getSyncData() {
        let puzzleId = window.gameData.today.id.toString();
        let gameData;
        let lsKeysFiltered = Object.keys(localStorage).filter((key) => /^games-state-spelling_bee\/\d+$/.test(key));
        
        // if the user has never been logged in, e.g. in an incognito window
        if (!lsKeysFiltered.length) {
            return [];
        }

        // At this point the user is either logged or has been logged in at some point.
        // `nyt-auth-action=logout` indicates, the user was logged in but is no longer
        if(/nyt-auth-action=logout/.test(document.cookie)) {
            return []
        }

        gameData = JSON.parse(localStorage.getItem(lsKeysFiltered.shift()) || "{}");
        if (!gameData.states) {
            return [];
        }

        gameData.states = gameData.states.filter((item) => item.puzzleId === puzzleId);
        if (!gameData.states.length) {
            return [];
        }
        
        return gameData.states.shift().data.answers || [];
    }

    /**
     * Retrieve environment
     * @param {String} env desktop|mobile
     * @returns {Boolean}
     */
    envIs(env) {
        return document.body.classList.contains("pz-" + env);
    }

    /**
     * Start the application once the result list has been generated.
     * The result list depends on sync data from the server and it can therefore be assumed that everything is ready
     */
    load() {
        fn.waitFor(".sb-wordlist-items-pag", this.gameWrapper).then((resultList) => {
            // Observe game for various changes
            this.observer = this.buildObserver();
            data.init(this, this.getSyncData());
            this.modalWrapper = fn.$(".sb-modal-wrapper", this.gameWrapper);
            this.resultList = resultList;

            this.add();
            this.domSet("active", true);
            this.registerPlugins();
            this.trigger(prefix("refreshUi"));
            document.dispatchEvent(new Event(prefix("ready")));
            if (this.envIs("desktop")) {
                window.scrollTo(0, 472);
            }
        });
    }

    /**
     * See if the app is displayed or not
     * @returns {App}
     */
    getState() {
        return this.domGet("active");
    }

    /**
     * Change app state
     * @param state
     * @returns {App}
     */
    toggle(state) {
        this.domSet("active", state);
        return this;
    }

    /**
     * Observe game for various changes
     * @returns {MutationObserver}
     */
    buildObserver() {
        const observer = new MutationObserver((mutationList) => {
            mutationList.forEach((mutation) => {
                if (!(mutation.target instanceof HTMLElement)) {
                    return false;
                }

                switch (true) {
                    // 'yesterday' modal is open
                    case mutation.type === "childList" && mutation.target.isSameNode(this.modalWrapper):
                        if (fn.$(".sb-modal-frame.yesterday", mutation.target)) {
                            this.trigger(prefix("yesterday"), mutation.target);
                        }
                        break;

                    // text input
                    case mutation.type === "childList" && mutation.target.classList.contains("sb-hive-input-content"):
                        this.trigger(prefix("newInput"), mutation.target.textContent.trim());
                        break;

                    // term added to word list
                    case mutation.type === "childList" &&
                        mutation.target.isSameNode(this.resultList) &&
                        !!mutation.addedNodes.length &&
                        !!mutation.addedNodes[0].textContent.trim() &&
                        mutation.addedNodes[0] instanceof HTMLElement:
                        this.trigger(prefix("newWord"), mutation.addedNodes[0].textContent.trim());
                        break;
                }
            });
        });
        const args = {
            target: this.gameWrapper,
            options: {
                childList: true,
                subtree: true,
                attributes: true,
            },
        };
        observer.observe(args.target, args.options);
        return observer;
    }

    /**
     * Build the app UI
     * @returns {HTMLElement}
     */
    buildUi() {
        const events = {};
        events[prefix("destroy")] = () => {
            this.observer.disconnect();
            this.container.remove();
            this.domUnset("theme");
        };

        const classNames = [settings.get("prefix")];

        return fn.div({
            data: {
                id: this.key,
                version: settings.get("version"),
            },
            classNames,
            events,
        });
    }

    /**
     * Register all plugins
     * @returns {App}
     */
    registerPlugins() {
        this.plugins = new Map();
        Object.values(getPlugins()).forEach((plugin) => {
            const instance = new plugin(this);
            instance.add();
            this.plugins.set(instance.key, instance);
        });
        this.trigger(prefix("pluginsReady"), this.plugins);
        return this;
    }

    /**
     * Add app to the DOM
     */
    add() {
        this.container.append(this.ui);
        fn.$(".sb-content-box", this.gameWrapper).prepend(this.container);
    }

    /**
     * Builds the app
     * @param {HTMLElement} gameWrapper
     */
    constructor(gameWrapper) {
        super(settings.get("label"), {
            canChangeState: true,
            key: prefix("app"),
        });

        // Kill existing instance - this could happen on a conflict between bookmarklet and extension
        // or while debugging
        const oldInstance = fn.$(`[data-id="${this.key}"]`);
        if (oldInstance) {
            oldInstance.dispatchEvent(new Event(prefix("destroy")));
        }

        // Outer container
        this.gameWrapper = gameWrapper;

        // App UI
        this.ui = this.buildUi();

        // init dom elements for external access
        this.container = fn.div({
            classNames: [prefix("container", "d")],
        });

        this.load();
    }
}

export default App;
