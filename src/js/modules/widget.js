import {
    camel
} from './string.js';
import settings from './settings.js';
import getIcon from './icons.js';
import el from './element.js';

/**
 * Plugin base class
 */
class Widget {

    /**
     * Cannot be hidden or otherwise disabled by user, default state
     * @type {boolean}
     */
    defaultActive = true;

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
     * Can be deactivated
     * @type {boolean}
     */
    canDeactivate = false;

    /**
     * Tells if the user has deactivated a plugin, falls back on default setting
     * @returns {boolean}
     */
    isActive = () => {
        const stored = settings.get(`options.${this.key}`);
        return typeof stored !== 'undefined' ? stored : this.defaultActive;
    }

    /**
     * Switches plugins on and off
     * @param {boolean} state
     * @returns {Widget}
     */
    toggle = state => {
        if (!this.canDeactivate) {
            return this;
        }
        settings.set(`options.${this.key}`, state);
        this.ui.classList.toggle('inactive', !state);
        return this;
    }

    enableTool = (iconKey, textToActivate, textToDeactivate) => {
        this.tool = el.div({
            events: {
                click: () => {
                    this.toggle(!this.isActive());
                    this.tool.title = this.isActive() ? textToDeactivate : textToActivate;
                }
            },
            attributes: {
                title: this.isActive() ? textToDeactivate : textToActivate
            }
        })
        this.tool.append(getIcon(iconKey));
    }

    /**
     * Some plugins, for instance `darkMode` have no UI
     * @returns {boolean}
     */
    hasUi = () => {
        return this.ui instanceof HTMLElement;
    }

    /**
     * Assign an event to the ui
     * @returns {Widget}
     */
    on = (evt, action) => {
        this.ui.addEventListener(evt, action);
        return this;
    }

    /**
     * Fire an event from the ui
     * @returns {Widget}
     */
    trigger = evt => {
        this.ui.dispatchEvent(evt);
        return this;
    }

    constructor(title, {
        key,
        canDeactivate,
        defaultActive
    } = {}) {
        if (!title) {
            throw new TypeError(`Missing 'title' from ${this.constructor.name}`);
        }
        this.title = title;
        this.key = key || camel(title);
        this.canDeactivate = typeof canDeactivate !== 'undefined' ? canDeactivate : this.canDeactivate;
        this.defaultActive = typeof defaultActive !== 'undefined' ? defaultActive : this.defaultActive;
    }
}

export default Widget;