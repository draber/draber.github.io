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
    defaultState = true;

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
    canChangeState = false;

    /**
     * Tells if the user has deactivated a plugin, falls back on default setting
     * @returns {boolean}
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
        if(this.hasUi()){
            this.ui.classList.toggle('inactive', !state);
        }
        return this;
    }

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
     * @returns {Widget}
     */
    on(evt, action) {
        this.ui.addEventListener(evt, action);
        return this;
    }

    /**
     * Fire an event from the ui
     * @returns {Widget}
     */
    trigger(evt) {
        this.ui.dispatchEvent(evt);
        return this;
    }

    constructor(title, {
        key,
        canChangeState,
        defaultState
    } = {}) {
        if (!title) {
            throw new TypeError(`Missing 'title' from ${this.constructor.name}`);
        }
        this.title = title;
        this.key = key || camel(title);
        this.canChangeState = typeof canChangeState !== 'undefined' ? canChangeState : this.canChangeState;
        this.defaultState = typeof defaultState !== 'undefined' ? defaultState : this.defaultState;
    }
}

export default Widget;