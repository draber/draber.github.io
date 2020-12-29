import settings from './settings.js';
import Widget from './widget.js';

/**
 * Plugin base class
 */
class Plugin extends Widget {

    /**
     * Parent element of plugin, if applicable
     * @type {undefined|HTMLElement}
     */
    target;

    /**
     * App container object, not the app UI!
     * @type {App}
     */
    app;

    /**
     * Attaches plugins to DOM, creates slot in app if needed
     * @returns {Widget}
     */
    attach() {
        this.toggle(this.getState());
        if (!this.hasUi()) {
            return this;
        }
        this.ui.dataset.ui = this.key;
        (this.target || this.app.ui).append(this.ui);
        return this;
    }

    /**
     * Adds plugin to DOM and registers state in local storage
     * @returns {Widget}
     */
    add() {
        if (this.canChangeState) {
            settings.set(`options.${this.key}`, this.getState());
        }
        return this.attach();
    }

    /**
     * Build an instance of a plugin
     * @param {App} app
     * @param {String} title
     * @param {{key: String, canChangeState: Boolean, defaultState: *}}
     */
    constructor(app, title, {
        key,
        canChangeState,
        defaultState
    } = {}) {
        super(title, {
            key,
            canChangeState,
            defaultState
        })
        this.app = app;
    }
}

export default Plugin;