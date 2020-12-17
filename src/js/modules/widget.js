import {
    camel
} from './string.js';

/**
 * Plugin base class
 */
class widget {

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
     * Some plugins, for instance `darkMode` have no UI
     * @returns {boolean}
     */
    hasUi = () => {
        return this.ui instanceof HTMLElement;
    }    

    /**
     * Assign an event to the ui
     * @returns {widget}
     */
    on = (evt, action) => {
        this.ui.addEventListener(evt, action);
        return this;
    }

    /**
     * Fire an event from the ui
     * @returns {widget}
     */
    trigger = evt => {
        this.ui.dispatchEvent(evt);
        return this;
    }

    constructor(title, {
        key
    } = {}) {
        if (!title) {
            throw new TypeError(`Missing 'title' from ${this.constructor.name}`);
        }
        this.title = title;
        this.key = key || camel(title);
    }
}

export default widget;
