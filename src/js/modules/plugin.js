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
     * @type {app}
     */
    app;

    /**
     * Attaches plugins to DOM, creates slot in app if needed
     * @returns {Widget}
     */
    attach() {
        if (!this.hasUi()) {
            return this;
        }
        this.ui.dataset.ui = this.key;
        this.toggle(this.getState());
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

    constructor(app, title, {
        key,
        canChangeState,
        defaultState
    } = {}) {
        if (!app || !title) {
            throw new TypeError(`${Object.getPrototypeOf(this.constructor).name} expects at least 2 arguments, 'app' or 'title' missing from ${this.constructor.name}`);
        }
        super(title, {
            key,
            canChangeState,
            defaultState
        })
        this.app = app;
    }
}

export default Plugin;