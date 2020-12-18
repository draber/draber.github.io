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
     * Tells if the user has disabled a plugin, falls back on default setting
     * @returns {boolean}
     */
    isEnabled = () => {
        const stored = settings.get(`options.${this.key}`);
        return typeof stored !== 'undefined' ? stored : this.defaultActive;
    }

    /**
     * Attaches plugins to DOM, creates slot in app if needed
     * @returns {Widget}
     */
    attach = () => {
        if (!this.hasUi()) {
            return this;
        }
        this.ui.dataset.ui = this.key;
        this.toggle(this.isEnabled());
        (this.target || this.app.ui).append(this.ui);
        return this;
    }

    /**
     * Adds plugin to DOM and registers state in local storage
     * @returns {Widget}
     */
    add = () => {
        if (this.canDeactivate) {
            settings.set(`options.${this.key}`, this.isEnabled());
        }
        return this.attach();
    }

    constructor(app, title, {
        key,
        canDeactivate,
        defaultActive
    } = {}) {
        if (!app || !title) {
            throw new TypeError(`${Object.getPrototypeOf(this.constructor).name} expects at least 2 arguments, 'app' or 'title' missing from ${this.constructor.name}`);
        }
        super(title, { key, canDeactivate, defaultActive })
        this.app = app;
    }
}

export default Plugin;
