import el from './element.js';
import settings from './settings.js';
import observers from "./observers";

/**
 * Settings from localStorage
 * @type {Object}
 */
const stored = settings.getStored();

/**
 * Add a slot to the app and attach the plugin
 * @param {HTMLElement} app
 * @param {HTMLElement} plugin
 * @param {String }key
 * @param {String} title
 * @param {Boolean} optional
 * @param {Object|null} observer
 * @returns {HTMLElement}
 */
const add = (app, plugin, key, title, optional, observer = null) => {
    let slot = el.$(`[data-plugin="${key}"]`, app);
    if(!slot){
        slot = el.create({
            data: {
                plugin: key
            }});
        app.append(slot);
    }
    // can be opted out?
    const available = (stored[key] ? stored[key].v : optional);
    if(optional) {
       settings.set(key, { v: available, t: `Display "${title}"` });
    }    
    const evtName = settings.get('ns') + key.charAt(0).toUpperCase() + key.slice(1);

    // react to opt in/out
    app.addEventListener(evtName, evt => {
        if(evt.detail.enabled){
            add(app, plugin, key, title, optional);
        }
        else {
            remove(plugin, key, title);
        }
    });
    // finalize observer initialization
    if(observer) {
        observers.add(observer.observer, observer.target, observer.args);
    }
    slot.append(plugin);
    return plugin;
}

/**
 * Remove the plugin nut retain the slot, stop observers
 * @param {HTMLElement} plugin
 * @param {String }key
 * @param {String} title
 * @param {Object|null} observer
 * @returns {null}
 */
const remove = (plugin, key, title, observer = null) => {
    if(!plugin) {
        console.error(`Plugin "${title}" not initialized`);
        return null;
    }
    plugin.remove();
    settings.set(key, { v: false, t: `Display ${title}` });
    if(observer){
        observers.remove(observer.observer);
    }
    return null;
}

export default {
    add,
    remove
}
