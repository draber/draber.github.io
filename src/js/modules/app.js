/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import timing from "../utils/timing.js";
import settings from "./settings.js";
import data from "./data.js";
import hive from "./hive.js";
import getPlugins from "./importer.js";
import Widget from "./widget.js";
import { prefix } from "../utils/string.js";
import fn from "fancy-node";
import nyt from "../nyt/nyt.js";
import outageNotice from "../widgets/outageNotice.js";
import pluginRegistry from "./pluginRegistry.js";
import shortcutRegistry from "./shortcutRegistry.js";

/**
 * App container
 */
class App extends Widget {
    /**
     * How long to wait for the result list and the toolbar before giving up, in milliseconds,
     * counted from the first click or key press. While a screen is in front of the game (welcome, Genius,
     * the loading spinner) the clock starts over, see nyt.waitForResultList(); this only covers building
     * the game after "Continue", which took up to 8s on 21.11.2026.
     * @type {Number}
     */
    static resultListTimeout = 15000;

    /**
     * Set a `data` value on `<body>`
     * @param {String} key
     * @param {*} value
     * @returns {App}
     */
    domSet(key, value) {
        document.body.dataset[prefix(key)] = value;
        return this;
    }

    /**
     * Remove a `data` value from `<body>`
     * @param {String} key
     * @returns {App}
     */
    domUnset(key) {
        delete document.body.dataset[prefix(key)];
        return this;
    }

    /**
     * Retrieve a `data` value from `<body>`
     * @param {String} key
     * @returns {*} the parsed value, false if not set
     */
    domGet(key) {
        if (typeof document.body.dataset[prefix(key)] === "undefined") {
            return false;
        }
        return JSON.parse(document.body.dataset[prefix(key)]);
    }

    /**
     * Retrieve environment
     * @param {String} env desktop|mobile
     * @returns {Boolean}
     */
    envIs(env) {
        return nyt.isEnv(env);
    }

    /**
     * Position the game on launch
     * @returns {Boolean}
     */
    focusGame() {
        const titleBar = nyt.find("titleBar", document);
        const gameHeader = nyt.find("gameHeader", document);
        if (!this.envIs("desktop") || !titleBar || !gameHeader) {
            return false;
        }
        window.scrollTo(0, 0);
        const titlebarRect = titleBar.getBoundingClientRect();
        window.scrollTo(0, titlebarRect.top + titlebarRect.height - gameHeader.offsetHeight);
        return true;
    }

    /**
     * The NYT page has changed in a way SBA can't handle: all or nothing.
     * Remove whatever has been added already and show a notice instead of a half-working assistant.
     * @param {String[]} problems
     * @returns {App}
     */
    fail(problems) {
        this.failed = true;
        timing.mark("failed");
        this.ui.dispatchEvent(new Event(prefix("destroy")));
        outageNotice.show(problems);
        return this;
    }

    /**
     * Start the application once the result list has been generated.
     * The result list depends on sync data from the server, so it can be assumed that everything is ready.
     * If anything SBA depends on is missing or the start fails, SBA doesn't start at all, see `fail()`.
     * @returns {Promise<void>}
     */
    load() {
        return Promise.all([nyt.waitForResultList(App.resultListTimeout), nyt.waitForToolbar(App.resultListTimeout)])
            .then(([resultList]) => {
                const { ok, problems } = nyt.selfCheck();
                if (!ok) {
                    this.fail(problems.map((problem) => `${problem.selector} not found (${problem.impact})`));
                    return;
                }
                try {
                    this.start(resultList);
                } catch (error) {
                    console.error(error);
                    this.fail([`start failed: ${error.message}`]);
                }
            })
            .catch((error) => this.fail([error.message]));
    }

    /**
     * Build the assistant
     * @param {HTMLElement} resultList
     */
    start(resultList) {
        this.resultList = resultList;
        this.observer = this.buildObserver();
        data.init(this, nyt.getFoundTerms(resultList));
        hive.init();

        this.add();
        this.domSet("active", true);
        shortcutRegistry.add(this.shortcut);
        this.registerPlugins();
        this.trigger(prefix("refreshUi"), null);
        document.dispatchEvent(new Event(prefix("ready")));
        timing.mark("ready");

        document.addEventListener("keydown", this.onKeyDown);

        this.on(prefix("newInput"), () => {
            if (this.pendingShortcut) {
                shortcutRegistry.handleShortcut(this.pendingShortcut);
                this.pendingShortcut = null;
            }
        });
        this.focusGame();
    }

    /**
     * Fire shortcuts.
     * Shortcuts with a character key also type that character into the game.
     * These are delayed until the input has changed, the character is then deleted before the shortcut runs.
     * @param {KeyboardEvent} event
     */
    onKeyDown = (event) => {
        if (!shortcutRegistry.getSbaShortcutEntry(event)) {
            return;
        }
        if (!shortcutRegistry.requiresDeletion(event)) {
            shortcutRegistry.handleShortcut(event);
        } else {
            this.pendingShortcut = event;
        }
    };

    /**
     * Close NYT modals with Escape. SBA pop-ups close themselves.
     * @param {KeyboardEvent} event
     */
    onKeyUp = (event) => {
        if (event.code === "Escape") {
            nyt.closeModal();
        }
    };

    /**
     * See if the app is displayed or not
     * @returns {Boolean}
     */
    getState() {
        return this.domGet("active");
    }

    /**
     * Change app state
     * @returns {App}
     */
    toggle() {
        this.domSet("active", !this.getState());
        return this;
    }

    /**
     * Handle a single mutation of the game
     * @param {MutationRecord} mutation
     */
    handleMutation(mutation) {
        if (mutation.type !== "childList" || !(mutation.target instanceof HTMLElement)) {
            return;
        }

        // text input
        if (nyt.isHiveInput(mutation.target)) {
            this.trigger(prefix("newInput"), mutation.target);
            return;
        }

        // term added to word list
        if (mutation.target === this.resultList) {
            const item = mutation.addedNodes[0];
            if (item instanceof HTMLElement && item.textContent.trim()) {
                this.trigger(prefix("newWord"), nyt.getTermFromListItem(item));
            }
            return;
        }

        // 'yesterday' modal is open, the NYT renders it on demand
        const yesterday = nyt.findYesterdayModal(mutation.addedNodes);
        if (yesterday) {
            this.trigger(prefix("yesterday"), yesterday);
        }
    }

    /**
     * Observe game for various changes
     * @returns {MutationObserver}
     */
    buildObserver() {
        const observer = new MutationObserver((mutationList) => {
            mutationList.forEach((mutation) => this.handleMutation(mutation));
        });
        observer.observe(this.gameWrapper, {
            childList: true,
            subtree: true,
        });
        return observer;
    }

    /**
     * Build the app UI
     * @returns {HTMLElement}
     */
    buildUi() {
        const events = {};
        events[prefix("destroy")] = () => {
            this.observer?.disconnect();
            document.removeEventListener("keydown", this.onKeyDown);
            document.removeEventListener("keyup", this.onKeyUp);
            this.container.remove();
            this.domUnset("theme");
            this.domUnset("active");
            this.domUnset("health");
        };

        return fn.div({
            data: {
                id: this.key,
                version: settings.get("version"),
            },
            classNames: [settings.get("prefix")],
            events,
        });
    }

    /**
     * Register all plugins
     * @returns {App}
     */
    registerPlugins() {
        Object.values(getPlugins()).forEach((plugin) => {
            pluginRegistry.register(plugin, this);
        });
        this.plugins = pluginRegistry.getPlugins();
        this.trigger(prefix("pluginsReady"), this.plugins);
        return this;
    }

    /**
     * Add app to the DOM
     * @returns {App}
     */
    add() {
        this.container.append(this.ui);
        nyt.find("contentBox").prepend(this.container);
        return this;
    }

    /**
     * Builds the app
     * @param {HTMLElement} gameWrapper
     */
    constructor(gameWrapper) {
        super(settings.get("label"), {
            key: prefix("app"),
        });

        // Outer container
        this.gameWrapper = gameWrapper;

        // App UI
        this.ui = this.buildUi();

        // init dom elements for external access
        this.container = fn.div({
            classNames: [prefix("container", "d")],
        });

        /**
         * Shortcut event waiting for the input to change, see `onKeyDown()`
         * @type {KeyboardEvent|null}
         */
        this.pendingShortcut = null;

        this.shortcut = {
            combo: "Shift+Alt+A",
            label: "Assistant Panel",
            module: this.key,
            callback: () => this.toggle(),
        };

        // Escape closes NYT modals and moments right away, not only once the game is there:
        // the Genius screen, for instance, is shown before the game is rendered, while the app still waits
        document.addEventListener("keyup", this.onKeyUp);

        /**
         * Resolves once the app has started, or failed to start (see `fail()`)
         * @type {Promise<void>}
         */
        this.ready = this.load();
    }
}

export default App;
