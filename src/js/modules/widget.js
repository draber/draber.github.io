/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

import {
    camel
} from '../utils/string.js';

/**
 * Plugin base class
 */
class Widget {

    /**
     * Some plugins have no UI
     * @returns {Boolean}
     */
    hasUi() {
        return this.ui instanceof HTMLElement;
    }

    /**
     * Assign an event to the ui
     * @param {String} type
     * @param {Function} action
     * @returns {Widget}
     */
    on(type, action) {
        if (this.hasUi()) {
            this.ui.addEventListener(type, action);
        }
        return this;
    }

    /**
     * Fire an event from the ui
     * @param {String } type
     * @param {*} data
     * @returns {Widget}
     */
    trigger(type, data) {
        if (this.hasUi()) {
            this.ui.dispatchEvent(data ? new CustomEvent(type, {
                detail: data
            }) : new Event(type));
        }
        return this;
    }

    /**
     * Build an instance of the widget
     * @param {String} title
     * @param {String} key
     */
    constructor(title, {
        key
    } = {}) {
        if (!title) {
            throw new TypeError(`Missing 'title' from ${this.constructor.name}`);
        }

        /**
         * Used when the plugin is mentioned anywhere in the UI
         * @type {String}
         */
        this.title = title;

        /**
         * Used for instance to register the plugin, mostly the title in camelCase
         * @type {String}
         */
        this.key = key || camel(title);

        /**
         * Null by default, most plugins will overwrite this
         * @type {null|HTMLElement}
         */
        this.ui = null;
    }
}

export default Widget;