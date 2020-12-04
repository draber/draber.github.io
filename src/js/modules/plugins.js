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
 * Has the user disabled the plugin?
 * @param {String} key
 * @returns {boolean}
 */
const isDisabled = key => {
    return settings.get(`options.${key}.v`) === false;
}

/**
 * Add a slot to the app and attach the plugin
 * @param {HTMLElement} app
 * @param {String} key
 * @param {HTMLElement|undefined|String} plugin
 * @param {String} title
 * @param {Boolean} optional
 * @param {Object|undefined} observer
 * @returns {HTMLElement|undefined}
 */
const add = ({
    app,
    key,
    plugin,
    title = '',
    optional = false,
    observer,
    target = null
} = {}) => {
    if(plugin !== noUi) {
        target = target || el.$(`[data-plugin="${key}"]`, app) || (() => {
            const _target = el.create({
                data: {
                    plugin: key
                }
            });
            app.append(_target);
            return _target;
        })();
        target.append(plugin);
    }

    // can be opted out?
    if (optional) {
        settings.set(`options.${key}`, {
            v: plugin instanceof HTMLElement,
            t: title
    });

    // react to opt in/out
    const evtName = pf(key);
    app.addEventListener(evtName, evt => {
        if (evt.detail.enabled) {
            add({
                app,
                plugin,
                key,
                title,
                optional
            });
        } else {
            remove({
                plugin,
                key,
                title
            });
        }
    });
    // finalize observer initialization
    if (observer) {
        observers.add(observer.observer, observer.target, observer.args);
    }
    return plugin;
}

/**
 * Remove the plugin nut retain the slot, stop observers
 * @param {HTMLElement} plugin
 * @param {String} key
 * @param {String} title
 * @param {Object|undefined} observer
 * @returns {null}
 */
const remove = ({
    plugin,
    key = '',
    title = '',
    observer
} = {}) => {
    if (plugin instanceof HTMLElement) {
        plugin.remove();
    }
    settings.set(`options.${key}.v`, false);
    if (observer) {
        observers.remove(observer.observer);
    }
    return null;
}

export default {
    add,
    remove,
    isDisabled,
    noUi
}
