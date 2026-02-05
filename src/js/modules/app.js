/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import settings from "./settings.js";
import data from "./data.js";
import hive from "./hive.js";
import getPlugins from "./importer.js";
import Widget from "./widget.js";
import { prefix } from "../utils/string.js";
import fn from "fancy-node";
import pluginRegistry from "./pluginRegistry.js";
import shortcutRegistry from "./shortcutRegistry.js";

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
   * Retrieve sync data from DOM
   * @param {HTMLElement} resultsList
   * @returns {Array}
   */
  getSyncData() {
    return Array.from(fn.$$("li", this.resultList)).map((li) =>
      li.textContent.trim(),
    );
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
   * Position the game on launch
   * @returns {Boolean}
   */
  focusGame() {
    if (!this.envIs("desktop")) {
      return false;
    }
    fn.$("#js-hook-pz-moment__welcome .pz-moment__button.default").addEventListener(
      "pointerup",
      () => {
        window.scrollTo(0, 0);
        const titlebarRect = fn.$(".pz-game-title-bar").getBoundingClientRect();
        const targetOffsetTop =
          titlebarRect.top +
          titlebarRect.height -
          fn.$(".pz-game-header").offsetHeight;
        window.scrollTo(0, targetOffsetTop);
      },
      false,
    );
    return true;
  }

  /**
   * Start the application once the result list has been generated.
   * The result list depends on sync data from the server and it can therefore be assumed that everything is ready
   */
  load() {
    fn.waitFor(".sb-wordlist-items-pag", this.gameWrapper).then(
      (resultList) => {
        // Observe game for various changes
        this.observer = this.buildObserver();
        this.modalWrapper = fn.$("#portal-game-modals .sb-modal-wrapper", this.gameWrapper);
        this.resultList = resultList;
        data.init(this, this.getSyncData());
        hive.init(fn.$(".sb-controls-box", this.gameWrapper));

        this.add();
        this.domSet("active", true);
        shortcutRegistry.add(this.shortcut);
        this.registerPlugins();
        this.trigger(prefix("refreshUi"), null);
        document.dispatchEvent(new Event(prefix("ready")));

        // fire shortcuts
        document.addEventListener("keydown", (event) => {
          if (!shortcutRegistry.getSbaShortcutEntry(event)) {
            return;
          }
          if (!shortcutRegistry.requiresDeletion(event, this)) {
            shortcutRegistry.handleShortcut(event); // run immediately
          } else {
            this._lastShortcutEvent = event; // delay and run after newInput
          }
        });

        this.on(prefix("newInput"), (event) => {
          if (this._lastShortcutEvent) {
            shortcutRegistry.handleShortcut(this._lastShortcutEvent);
            this._lastShortcutEvent = null;
          }
        });
        this.focusGame();
      },
    );
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
   * @returns {App}
   */
  toggle() {
    this.domSet("active", !this.getState());
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
          case mutation.type === "childList" &&
            mutation.target.isSameNode(this.modalWrapper):
            if (fn.$(".sb-modal-frame.yesterday", mutation.target)) {
              this.trigger(prefix("yesterday"), mutation.target);
            }
            break;

          // text input
          case mutation.type === "childList" &&
            mutation.target.classList.contains("sb-hive-input-content"):
            this.trigger(prefix("newInput"), mutation.target);
            break;

          // term added to word list
          case mutation.type === "childList" &&
            mutation.target.isSameNode(this.resultList) &&
            !!mutation.addedNodes.length &&
            !!mutation.addedNodes[0].textContent.trim() &&
            mutation.addedNodes[0] instanceof HTMLElement:
            this.trigger(
              prefix("newWord"),
              mutation.addedNodes[0].textContent.trim(),
            );
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
    Object.values(getPlugins()).forEach((plugin) => {
      pluginRegistry.register(plugin, this);
    });
    this.plugins = pluginRegistry.getPlugins();
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

    this.shortcut = {
      combo: "Shift+Alt+A",
      label: "Assistant Panel",
      module: this.key,
      callback: () => this.toggle(),
    };

    this.load();
  }
}

export default App;
