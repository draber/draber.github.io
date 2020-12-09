import el from './element.js';
import settings from './settings.js';
import {
    camel
} from './string.js';

/**
 * Plugin base class
 */
class plugin {

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
     * Undefined by default, most plugins will overwrite this
     * @type {undefined|HTMLElement}
     */
    ui;

    /**
     * Used when the plugin is mentioned anywhere in the UI
     * @type {string}
     */
    title;

    /**
     * Used for instance to register the plugin, mostly the title in camelCase
     * @type {string}
     */
    key;

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
     * Some plugins, for instance `darkMode` have no UI
     * @returns {boolean}
     */
    hasUi = () => {
        return this.ui instanceof HTMLElement;
    }

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
            const _target = el.create({
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
        this.app = app;
        if (!app || !title) {
            throw new TypeError(`${Object.getPrototypeOf(this.constructor).name} expects at least 2 arguments, only 1 was passed from ${this.constructor.name}`);
        }
        this.title = title;
        this.key = key || camel(title);
        this.optional = typeof optional !== 'undefined' ? optional : this.optional;
        this.defaultEnabled = typeof defaultEnabled !== 'undefined' ? defaultEnabled : this.defaultEnabled;
    }
}

export default plugin;
