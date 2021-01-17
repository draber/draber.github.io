import {
    camel
} from './string.js';
import settings from './settings.js';
import getIcon from './icons.js';
import el from './element.js';

// noinspection JSUnresolvedFunction
/**
 * Plugin base class
 */
class Widget {

    /**
     * Tells if the user has deactivated a plugin, falls back on default setting
     * @returns {*}
     */
    getState() {
        const stored = settings.get(`options.${this.key}`);
        return typeof stored !== 'undefined' ? stored : this.defaultState;
    }

    /**
     * Switches plugins on and off
     * @param {boolean} state
     * @returns {Widget}
     */
    toggle(state) {
        if (!this.canChangeState) {
            return this;
        }
        settings.set(`options.${this.key}`, state);
        if (this.hasUi()) {
            this.ui.classList.toggle('inactive', !state);
        }
        return this;
    }

    /**
     * Build a tool for the tool bar
     * @param {String} iconKey
     * @param {String} textToActivate
     * @param {String} textToDeactivate
     * @returns {Widget}
     */
    enableTool(iconKey, textToActivate, textToDeactivate) {
        this.tool = el.div({
            events: {
                click: () => {
                    this.toggle(!this.getState());
                    this.tool.title = this.getState() ? textToDeactivate : textToActivate;
                }
            },
            attributes: {
                title: this.getState() ? textToDeactivate : textToActivate
            },
            data: {
                tool: this.key
            }

        })
        this.tool.append(getIcon(iconKey));
        return this;
    }

    /**
     * Some plugins, for instance `darkMode` have no UI
     * @returns {boolean}
     */
    hasUi() {
        return this.ui instanceof HTMLElement;
    }

    /**
     * Assign an event to the ui
     * @param type
     * @param action
     * @returns {Widget}
     */
    on(type, action) {
        this.ui.addEventListener(type, action);
        return this;
    }

    /**
     * Fire an event from the ui
     * @param type
     * @param data
     * @returns {Widget}
     */
    trigger(type, data) {
        this.ui.dispatchEvent(data ? new CustomEvent(type, {
            detail: data
        }) : new Event(type));
        return this;
    }

    /**
     * Build an instance of the widget
     * @param {String} title
     * @param {{key: String, canChangeState: Boolean, defaultState: *}}
     */
    constructor(title, {
        key,
        canChangeState,
        defaultState
    } = {}) {
        if (!title) {
            throw new TypeError(`Missing 'title' from ${this.constructor.name}`);
        }

        /**
         * Used when the plugin is mentioned anywhere in the UI
         * @type {string}
         */
        this.title = title;

        /**
         * Used for instance to register the plugin, mostly the title in camelCase
         * @type {string}
         */
        this.key = key || camel(title);

        /**
         * Can be deactivated
         * @type {boolean}
         */
        this.canChangeState = typeof canChangeState !== 'undefined' ? canChangeState : false;
        
        /**
         * Cannot be hidden or otherwise disabled by user, default state
         * @type {boolean}
         */
        this.defaultState = typeof defaultState !== 'undefined' ? defaultState : true;

        /**
         * Undefined by default, most plugins will overwrite this
         * @type {undefined|HTMLElement}
         */
        this.ui;
    }
}

export default Widget;