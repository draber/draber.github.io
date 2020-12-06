import el from './element.js';
import settings from './settings.js';
import observers from './observers';
import pf from './prefixer.js';

/**
 * For plugins that have no UI
 * @type {string}
 */
const noUi = 'noUi';

/**
 * Callbacks on add/remove
 * @param {Array} cb
 * @param {String} action
 */
const callback = (cb, action) => {
    if (cb && typeof cb[action] === 'function') {
        cb[action]();
    }
}

/**
 * Add event listeners
 * @param {*} plugin
 */
const addListeners = plugin => {
    const evtName = pf(plugin.key);
    plugin.app.addEventListener(evtName, evt => {
        if (evt.detail.enabled) {
            plugin(plugin.app, ...plugin.args);
        } else {
            remove(plugin);
        }
    });
}

/**
 * Get the current state
 * never used:                   defaultState
 * settings.options.v === false: disabled
 * settings.options.v === true:  enabled
 * @param {String} key 
 * @param {Boolean} defaultState 
 */
const isEnabled = (key, defaultState) => {
    const stored = settings.get(`options.${key}.v`);
    return typeof stored !== 'undefined' ? stored : defaultState;
}

/**
 * Get the element to which the ui should be added
 * @param {*} plugin
 * @param {Boolean} defaultState
 * @returns {Boolean}
 */
const attachPlugin = (plugin, defaultState) => {
    if (plugin.ui === noUi) {
        return false;
    }
    const target = plugin.target || el.$(`[data-ui="${plugin.key}"]`, plugin.app) || (() => {
        const _target = el.create({
            data: {
                plugin: plugin.key
            }
        });
        plugin.app.append(_target);
        return _target;
    })();
    if (isEnabled(plugin.key, defaultState)) {
        target.append(plugin.ui);
    }
    return true;
}


/**
 * Add a slot to the app and attach the ui
 * @param {*} plugin
 */
const add = (plugin) => {

    // set some defaults
    const defaultState = typeof plugin.defaultState === 'undefined' ? true : plugin.defaultState;
    const optional = typeof plugin.optional === 'undefined' ? false : plugin.optional;
    const title = typeof plugin.title === 'undefined' ? '' : plugin.title;
    
    // append plugins with a UI
    attachPlugin(plugin, defaultState);

    // can be opted out?
    if (optional) {
        settings.set(`options.${plugin.key}`, {
            t: title,
            v: isEnabled(plugin.key, defaultState)
        });
    }


    // // execute callbacks
    // callback(cb, 'add');

    // // add default event listeners
    addListeners(plugin);

    // // finalize observer initialization, if any
    if (plugin.observer && plugin.observer instanceof MutationObserver) {
        observers.add(plugin.observer);
    }
}

/**
 * Remove the ui but retain the slot, stop observers
 * @param {*} plugin
 * @returns {null}
 */
const remove = (plugin) => {
    if (plugin.ui instanceof HTMLElement) {
        plugin.ui.remove();
    }
    if (plugin.optional) {
        settings.set(`options.${plugin.key}.v`, false);
    }
    if (plugin.observer && plugin.observer instanceof MutationObserver) {
        observers.remove(plugin.observer);
    }
    callback(plugin.cb, 'remove');
    return null;
}

export default {
    add,
    remove,
    isEnabled,
    noUi
}