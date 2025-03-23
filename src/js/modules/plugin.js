/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import Widget from "./widget.js";

/**
 * Plugin base class
 */
class Plugin extends Widget {
    /**
     * Attaches plugins to DOM, creates slot in app if needed
     * @returns {Widget}
     */
    attach() {
        if (!this.hasUi()) {
            return this;
        }
        this.ui.dataset.ui = this.key;
        (this.target || this.app.ui)[this.addMethod](this.ui);
        return this;
    }

    /**
     * Adds plugin to DOM and registers state in local storage
     * @returns {Widget}
     */
    add() {
        return this.attach();
    }

    /**
     * Catch-all for run events
     * @param {Event} evt
     * @returns
     */
    // eslint-disable-next-line no-unused-vars
    run(evt) {
        return this;
    }

    /**
     * Build an instance of a plugin
     * @param {App} app
     * @param {String} title
     * @param {String} description
     * @param {{key: String, canChangeState: Boolean, defaultState: *}}
     */
    constructor(app, title, description, { key, canChangeState, defaultState, menuIcon, runEvt, addMethod } = {}) {
        super(title, {
            key,
            canChangeState,
            defaultState,
        });

        /**
         * Parent element of plugin, if applicable
         * @type {undefined|HTMLElement}
         */
        this.target;

        /**
         * Description of the plugin
         * @type {String}
         */
        this.description = description || "";

        /**
         * App container object, not the app UI!
         * @type {App}
         */
        this.app = app;

        this.addMethod = addMethod || "append";

        this.menuIcon = menuIcon || "checkbox";

        /**
         * Define keyboard shortcuts for this plugin.
         * Recommended format: Alt+Shift+<Key> to avoid browser conflicts.
         * Example:
         * this.shortcuts = [
         *   { combo: 'Alt+Shift+G', method: 'toggleGrid' },
         *   { combo: 'Alt+Shift+P', method: 'openPopup' }
         * ];
         */
        this.shortcuts = [];

        /**
         * Update plugin data on demand
         */
        if (runEvt) {
            this.app.on(runEvt, (evt) => {
                this.run(evt);
            });
        }
    }
}

export default Plugin;
