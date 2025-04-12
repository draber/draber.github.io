/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

import {
    camel
} from '../utils/string.js';
import settings from './settings.js';

/**
 * Plugin base class
 */
class Widget {

    /**
     * Tells if the user has deactivated a plugin, falls back on default setting
     * @returns {*}
     */
    getState() {
        const stored = settings.get(`options.${this.key}.enabled`);
        return typeof stored !== 'undefined' ? stored : this.defaultState;
    }

    /**
     * Write new state to memory
     * @param {Boolean|Object} state
     * @returns {Widget}
     */
    setState(state) {
        // if (this.canChangeState) {
        //     settings.set(`options.${this.key}.enabled`, state);
        // }
        return this;
    }

    /**
     * Switches plugins on and off
     * @param {Boolean} state
     * @returns {Widget}
     */
    toggle(state) {
        // if (!this.canChangeState) {
        //     return this;
        // }
        // this.setState(state);
        // if (this.hasUi()) {
        //     this.ui.classList.toggle('inactive', !state);
        // }
        return this;
    }

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
     * @param {Boolean} canChangeState
     * @param {Boolean} defaultState
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
         * @type {String}
         */
        this.title = title;

        /**
         * Used for instance to register the plugin, mostly the title in camelCase
         * @type {String}
         */
        this.key = key || camel(title);

        /**
         * Can be deactivated
         * @type {Boolean}
         */
        this.canChangeState = typeof canChangeState !== 'undefined' ? canChangeState : false;

        /**
         * Cannot be hidden or otherwise disabled by user, default state
         * @type {Boolean}
         */
        this.defaultState = typeof defaultState !== 'undefined' ? defaultState : true;

        // /**
        //  * `getState()` returns an actual value and not `undefined`
        //  * This ensures that `localStorage` stores proper values
        //  */
        // this.setState(this.getState());

        /**
         * Null by default, most plugins will overwrite this
         * @type {null|HTMLElement}
         */
        this.ui = null;
    }
}

export default Widget;