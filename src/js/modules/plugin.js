import el from './element.js';
import settings from './settings.js';
import widget from './widget.js';

/**
 * Plugin base class
 */
class plugin extends widget {

    /**
     * Not disabled by user, default state
     * @type {boolean}
     */
    defaultEnabled = true;

    /**
     * Can be disabled
     * @type {boolean}
     */
    optional = false;

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
        return typeof stored !== 'undefined' ? stored : this.defaultEnabled;
    }

    /**
     * Switches plugins on and off
     * @param {boolean} state
     */
    toggle = state => {
        settings.set(`options.${this.key}`, state);
        this.ui.classList.toggle('inactive', !state);
    }

    /**
     * Attaches plugins to DOM, creates slot in app if needed
     * @returns {boolean}
     */
    attach = () => {
        if (!this.hasUi()) {
            return false;
        }
        const target = this.target || el.$(`[data-ui="${this.key}"]`, this.app.ui) || (() => {
            const _target = el.div({
                data: {
                    plugin: this.key
                }
            });
            this.app.ui.append(_target);
            return _target;
        })();
        target.append(this.ui);
        return true;
    }

    /**
     * Adds plugin to DOM and registers state in local storage
     */
    add = () => {
        this.attach();
        if (this.optional) {
            settings.set(`options.${this.key}`, this.isEnabled());
        }
    }

    constructor(app, title, {
        key,
        optional,
        defaultEnabled
    } = {}) {
        if (!app || !title) {
            throw new TypeError(`${Object.getPrototypeOf(this.constructor).name} expects at least 2 arguments, 'app' or 'title' missing from ${this.constructor.name}`);
        }
        super(title, {key})
        this.app = app;
        this.optional = typeof optional !== 'undefined' ? optional : this.optional;
        this.defaultEnabled = typeof defaultEnabled !== 'undefined' ? defaultEnabled : this.defaultEnabled;
    }
}

export default plugin;
